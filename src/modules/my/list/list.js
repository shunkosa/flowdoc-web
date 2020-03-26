import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track message = 'Loading...';
    @track isLoading = true;
    @track flowList;

    connectedCallback() {
        fetch('api/flows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
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
        window.location.href = '../auth/logout';
    }
}
