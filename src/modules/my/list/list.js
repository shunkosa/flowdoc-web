import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track message = 'Loading...';
    @track isLoading = true;
    @track flowList;

    connectedCallback() {
        (async () => {
            const body = {
                instance_url: decodeURIComponent(this.getCookie('instance_url')),
                access_token: this.getCookie('access_token')
            };
            fetch('api/flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(body)
            })
                .then((response) => response.json())
                .then((data) => {
                    this.flowList = data.flows;
                    const numOfAvailableFlows = this.flowList.filter((f) => f.isSupported).length;
                    this.message = `${numOfAvailableFlows} of ${this.flowList.length} flows are available.`;
                })
                .catch((error) => console.log(error))
                .finally(() => {
                    this.isLoading = false;
                });
        })();
    }

    get hasFlowList() {
        return this.flowList && Object.keys(this.flowList).length !== 0;
    }

    getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return undefined;
    }

    chunk([...array], size = 1) {
        return array.reduce(
            (acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]),
            []
        );
    }
}
