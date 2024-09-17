import { Icon } from 'assets';
import { useLayout } from 'Context';

export function NotifHost() {
    let layout = useLayout();

    let notifs = [];
    for (let notif of layout.notif_stack) {
        notifs.push(
            <div className="relative pointer-events-auto bg-base-800 p-4 ml-auto mr-4 mb-4 max-w-max" key={notif.__id}>
                <button className="absolute right-2 top-2" onClick={()=>layout.remove_notif(notif)}>
                    <Icon name="cancel" color="icon-base-50" className="w-4 h-4" />
                </button>
                { notif.content }
            </div>
        );
    }

    return <div className="fixed right-0 bottom-0 z-50 bg-transparent pointer-events-none empty:hidden">
        { notifs }
    </div>;
}
