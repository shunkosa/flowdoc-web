import { register, ValueChangedEvent } from '@lwc/wire-service';

export default function getSession() {
    return fetch('/api/existense/session').then((response) => response.json());
}

register(getSession, (eventTarget) => {
    eventTarget.addEventListener('connect', () => {
        getSession()
            .then((data) => {
                eventTarget.dispatchEvent(new ValueChangedEvent({ data: data, error: undefined }));
            })
            .catch((error) => {
                eventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error: error }));
            });
    });

    eventTarget.addEventListener('disconnect', () => {});
});
