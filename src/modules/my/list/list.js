import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track username = 'Loading...';
    @track isLoading = true;
    @track flowList;
    locale = 'en';
    format = 'pdf';
    instanceUrl;

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
                this.instanceUrl = data.instanceUrl;
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
        if (this.format === 'pdf') {
            this.fetchPdf(name, flow);
        } else if (this.format === 'docx') {
            this.fetchDocx(name, flow);
        }
    }

    fetchPdf(name, flow) {
        fetch(`api/pdf`, {
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

    fetchDocx(name, flow) {
        fetch(`api/docx`, {
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
            .then((result) => {
                console.log(result);
                const base64 = result.base64;
                const bin = atob(base64.replace(/^.*,/, ''));
                const buffer = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) {
                    buffer[i] = bin.charCodeAt(i);
                }
                const blob = new Blob([buffer.buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });
                saveAs(blob, `${name}.docx`);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    logout() {
        window.location.href = '../auth/logout';
    }

    get processBuilderUrl() {
        return `${this.instanceUrl}/lightning/setup/ProcessAutomation/home`;
    }

    setLanguage(event) {
        this.locale = event.detail;
    }

    setFormat(event) {
        this.format = event.detail;
    }
}
