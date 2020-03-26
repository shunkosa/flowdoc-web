import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track username = 'Loading...';
    @track isLoading = true;
    @track flowList;
    locale = 'en';

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
                this.username = data.username;
            })
            .catch((error) => console.log(error))
            .finally(() => {
                this.isLoading = false;
            });
    }

    get hasFlowList() {
        return this.flowList && this.flowList.length !== 0;
    }

    get isEmpty() {
        return this.flowList && this.flowList.length === 0;
    }

    get flowCount() {
        return this.flowList ? this.flowList.length : 0;
    }

    get availableCount() {
        return this.flowList ? this.flowList.filter((f) => f.isSupported).length : 0;
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
                flow: flow,
                locale: this.locale
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

    setLanguage(event) {
        this.locale = event.detail;
    }
}
