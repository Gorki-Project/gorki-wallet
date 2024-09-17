import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";
import { useNodes, type NodeContext } from 'Context';
import { g, nw, useWritable } from 'utils';
import * as Components from 'components';
import { Icon } from 'assets';

function get_all_nodes(ctx: NodeContext) {
  return [...g.built_in_nodes, ...ctx.custom_nodes];
}

function NodeOptions() {
  let ctx = useNodes();
  let all_nodes = get_all_nodes(ctx);
  let groups: Record<string, JSX.Element[]> = {};

  for (let node of all_nodes) {
    let group_name = node.group ?? "Other";
    if (!(group_name in groups)) groups[group_name] = [];
    let group = groups[group_name];

    group.push(
      <option key={node.name} value={node.name}>
        {node.name} → {node.url}{node.port ? `:${node.port}` : null}
      </option>
    );
  }

  return Object.keys(groups).map(group_name =>
    <optgroup key={group_name} data-key={group_name} label={group_name}>
      {groups[group_name]}
    </optgroup>
  );
}

const CHAR_0 = "0".charCodeAt(0);
const CHAR_9 = "9".charCodeAt(0);

function valid_port(str: string) {
  if (str.length == 0) return true;

  for (let i=0; i<str.length; i++) {
    let chr = str.charCodeAt(i);
    if (chr < CHAR_0 || chr > CHAR_9) return false;
  }

  let num = parseInt(str, 10);
  return num >= 0 && num <= 65535;
}

function ShowErrors(props: { errs: Record<string, any> }) {
  return Object.entries(props.errs).map(([key, val]) =>
    val
    ? <p key={key} className="warning">{val}</p>
    : null
  );
}

function EditUrl(
  props: {
    title: string,
    errors: Record<string, any>,
    url: ReturnType<typeof useWritable<string>>,
    port: ReturnType<typeof useWritable<string>>,
    hidden?: boolean,
    children: JSX.Element
  }
) {
  return <div>
    <p>{props.title}</p>
    <div className="flex flex-wrap w-full justify-center gap-4">
      { props.children }

      {
        props.hidden ? null : <>
          <label title="URL" className="flex-1 basis-28">
            <input placeholder="URL"
              value={props.url.value}
              onChange={props.url.write}
            />
          </label>

          <label title="PORT" className="flex-1 basis-28">
            <input placeholder="PORT"
              value={props.port.value}
              onChange={props.port.write}
            />
          </label>
        </>
      }
    </div>

    {
      props.hidden ? null :
      <ShowErrors errs={props.errors} />
    }
  </div>;
}

function is_valid_url(str: string) {
  try {
    let url = new URL(str);
    return url.protocol === "http:" || url.protocol == "https:";
  } catch {
    return false;
  }
}

function EditNodeForm(
  { node, set_node }: {
    node: nw.Named_Node,
    set_node: Dispatch<SetStateAction<nw.Named_Node|null>>,
  }
) {
  const ctx = useNodes();

  const all_nodes = get_all_nodes(ctx);
  const editing = all_nodes.some(n => n.name == node.name);

  const name = useWritable(node.name);
  const url = useWritable(node.url);
  const port = useWritable(node.port != undefined ? `${node.port}` : "");

  const [with_validator, set_with_validator] = useState(!!node.read_only);
  const validator_url = useWritable(node.read_only?.url ?? node.url);
  const validator_port = useWritable(node.read_only?.url ?? node.url);

  const [with_admin, set_with_admin] = useState(!!node.admin);
  const admin_url = useWritable(node.read_only?.url ?? node.url);
  const admin_port = useWritable(node.read_only?.url ?? node.url);

  function name_errors(name: string) {
    let name_taken = false;
    if (!(editing && name == node.name)) {
      name_taken = all_nodes.some(n => n.name == name);
    }

    return {
      name_empty: name.length == 0 && "Missing node name!",
      name_taken: name_taken && `A node named "${name}" already exists!`
    }
  }

  function node_errors(url: string, port: string) {
    return {
      url_valid: url.length > 0 && !is_valid_url(url) && `"${url}" is not a valid url!`,
      url_empty: url.length == 0 && "Missing node url!",
      port_invalid: !valid_port(port) && `"${port}" is not a valid port number!`,
    };
  }

  function has_errors(errors: Record<string, any>) {
    for (let key in errors) {
      if (errors[key]) return true;
    }
    return false;
  }

  const name_errs = name_errors(name.value);
  const node_errs = node_errors(url.value, port.value);
  const validator_errs = with_validator ? node_errors(validator_url.value, validator_port.value) : {};
  const admin_errs = with_admin ? node_errors(admin_url.value, admin_port.value) : {};

  const any_err =
    has_errors(name_errs) ||
    has_errors(node_errs) ||
    has_errors(validator_errs) ||
    has_errors(admin_errs)
  ;

  function port_num(port: string) {
    if (!valid_port(port)) return undefined;
    if (port.length == 0) return 0;
    return parseInt(port, 10);
  }

  const created_node = {
    ...nw.custom_node(name.value, url.value, port_num(port.value)),
    read_only: with_validator ? {
      url: validator_url.value,
      port: port_num(validator_port.value)
    } : undefined,
    admin: with_admin ? {
      url: admin_url.value,
      port: port_num(admin_port.value)
    } : undefined
  };

  const node_str = nw.get_node_url(created_node);
  const validator_str = has_errors({...node_errs, ...validator_errs}) ? "" : nw.get_readonly_url(created_node);
  const admin_str = has_errors({...node_errs, ...admin_errs}) ? "" : nw.get_admin_url(created_node);

  return <>
    <EditUrl
      title={`Deploy URL ${node_str ? "("+node_str+")" : ""}`}
      errors={{...name_errs, ...node_errs}}
      url={url}
      port={port}
    >
      <label title="NAME" className="flex-1 basis-28">
        <input placeholder="NAME"
          value={name.value}
          onChange={name.write}
        />
      </label>
    </EditUrl>

    <EditUrl
      title={`Explore URL ${validator_str ? "("+validator_str+")" : ""}`}
      errors={validator_errs}
      url={validator_url}
      port={validator_port}
      hidden={!with_validator}
    >
      <Components.Button className="self-end" onClick={() => set_with_validator(!with_validator)}>
        {with_validator ? "USE DEFAULT" : "USE CUSTOM EXPLORE URL"}
      </Components.Button>
    </EditUrl>

    <EditUrl
      title={`Admin deploy URL ${admin_str ? "("+admin_str+")" : ""}`}
      errors={admin_errs}
      url={admin_url}
      port={admin_port}
      hidden={!with_admin}
    >
      <Components.Button className="self-end" onClick={() => set_with_admin(!with_admin)}>
        {with_admin ? "USE DEFAULT" : "USE CUSTOM ADMIN URL"}
      </Components.Button>
    </EditUrl>

    <div className="flex justify-between">
        <Components.Button
          className="w-min self-center"
          onClick={() => set_node(null)}
        >
          BACK
        </Components.Button>

        <Components.Button
          className="w-min self-center"
          disabled={any_err}
          onClick={() => {
            ctx.set_custom_node(
              editing ? node.name : null,
              {
                ...nw.custom_node(name.value, url.value, port_num(port.value)),
                read_only: with_validator ? {
                  url: validator_url.value,
                  port: port_num(validator_port.value)
                } : undefined,
                admin: with_admin ? {
                  url: admin_url.value,
                  port: port_num(admin_port.value)
                } : undefined
              }
            );
            set_node(null);
          }}
        >
          { editing ? "SAVE" : "CREATE" }
        </Components.Button>
    </div>
  </>
}

export function NodePicker() {
  const ctx = useNodes();
  const [editing, set_editing] = useState<nw.Named_Node|null>(null);

  function set_node(evt: ChangeEvent<HTMLSelectElement>) {
    let name = evt.target.value;
    let n = get_all_nodes(ctx).find(n => n.name == name);
    if (n) {
      ctx.set_node(n);
    }
  }

  return <div className="flex flex-col gap-8">
    <div className="flex gap-2 items-end">
      <label title="NODE">
        <select onChange={set_node} value={ctx.node.name} disabled={!!editing}>
          <NodeOptions />
        </select>
      </label>

      {ctx.node.editable ?
        <>
          <Components.Button className="p-2 rounded-full"
            onClick={() => set_editing(ctx.node)}
          >
            <Icon name="edit" color={"dark:icon-base-900 icon-base-50"} className="w-6 h-6" />
          </Components.Button>

          <Components.Button className="p-2 rounded-full"
            onClick={() => ctx.remove_custom_node(ctx.node.name)}
          >
            <Icon name="trash" color={"dark:icon-base-900 icon-base-50"} className="w-6 h-6" />
          </Components.Button>
        </> : null
      }
    </div>

      {
        editing == null ?
          <div className="flex flex-wrap w-full justify-center gap-4">
            <Components.Button
              className="self-center"
              onClick={() => set_editing(nw.custom_node("New node", ""))}
            >
              ADD A CUSTOM NODE
            </Components.Button>
          </div>
        :
          <EditNodeForm node={editing} set_node={set_editing} />
      }
  </div>;
}
