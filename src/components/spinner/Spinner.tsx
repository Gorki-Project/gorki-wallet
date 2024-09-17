import { ReactNode } from 'react';
import { OPERATION } from 'utils';
import { Icon } from 'assets';
import type { TW_Color } from "index/../../tailwind.config.js";

interface SpinnerProps {
  op: OPERATION;
  icon_class?: string;
  children_initial?: ReactNode;
  children_done?: ReactNode;
  style?: Record<string, any>;
  className?: string;
  color?: TW_Color<"icon">;
}

export function Spinner(props: SpinnerProps) {
  let style = props.style || {};

  switch (props.op) {
    case OPERATION.INITIAL:
      return (<>
        {props.children_initial}
      </>);
    case OPERATION.PENDING:
      return (<div className={"animate-spin pointer-events-none " + (props.className ?? "")} style={style}>
        <Icon name="spinner" color={props.color ?? "dark:icon-base-50 icon-base-950"} className={props.icon_class} />
      </div>)
    case OPERATION.DONE:
      return (<>
        {props.children_done}
      </>);
  }
}
