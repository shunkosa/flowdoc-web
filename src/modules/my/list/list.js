import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track message = 'Loading...';
    @track isLoading = true;
    @track flowList;

    connectedCallback() {
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
                if (this.flowList.length === 0) {
                    this.message = 'No flows/processes in the org.';
                } else {
                    const numOfAvailableFlows = this.flowList.filter((f) => f.isSupported).length;
                    this.message = `${numOfAvailableFlows} of ${this.flowList.length} flows/processes are available.`;
                }
            })
            .catch((error) => console.log(error))
            .finally(() => {
                this.isLoading = false;
            });
    }

    get hasFlowList() {
        return this.flowList && Object.keys(this.flowList).length !== 0;
    }

    download(event) {
        this.isLoading = true;
        const name = event.target.dataset.name;
        const flow = this.flowList.find((f) => f.fullName === name);
        fetch('api/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                name: name,
                flow: flow
            })
        })
            .then((response) => response.json())
            .then((docDefinition) => {
                pdfMake.createPdf(docDefinition).open();
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    logout() {
        this.deleteCookie('instance_url');
        this.deleteCookie('access_token');
        window.location.href = '../auth/logout';
    }

    getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return undefined;
    }

    deleteCookie(name) {
        document.cookie = `${name}=; max-age=0`;
    }

    chunk([...array], size = 1) {
        return array.reduce(
            (acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]),
            []
        );
    }
}
