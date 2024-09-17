import { useLayout } from 'Context';

export function ModalHost() {
    let layout = useLayout();
    if (layout.modal_stack.length === 0) { return <></>; }
    let modal = layout.modal_stack[layout.modal_stack.length - 1];

    function handle_click_outside() {
        if (modal.props.noCloseOnClickOutside) { return; }
        modal.props.onFinish(null);
        layout.pop_modal();
    }

    return (
        <div
            className="fixed inset-0 z-40 bg-base-900/75 backdrop-blur-sm"
            onClick={handle_click_outside}
        >
            <modal.component {...modal.props} />
        </div>
    );
}
