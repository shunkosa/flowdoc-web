import { LightningElement, track } from 'lwc';

export default class List extends LightningElement {
    @track username = 'Loading...';
    @track isLoading = true;
    @track flowSummaryList = [];
    @track flowList;
    locale = 'en';
    format = 'pdf';
    instanceUrl;

    errorStack = '';

    async connectedCallback() {
        try {
            const rawResponse = await fetch('api/flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
            const response = await rawResponse.json();
            this.username = response.username;
            this.instanceUrl = response.instanceUrl;
            this.flowSummaryList = response.flowList;
            if (response.flowList.length > 0) {
                await this.fetchDetails(response.flowList.slice(0, 10).map((f) => f.fullName));
            } else {
                this.flowList = [];
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadMore() {
        if (this.isLoading) {
            return;
        }
        try {
            this.isLoading = true;
            const flowNames = this.flowSummaryList
                .filter((s) => !this.flowList.some((f) => f.fullName === s.fullName))
                .slice(0, 10)
                .map((f) => f.fullName);
            console.log(flowNames);
            await this.fetchDetails(flowNames);
        } catch (error) {
            console.log(error);
        } finally {
            this.isLoading = false;
        }
    }

    async fetchDetails(flowNames) {
        const rawDetailResponse = await fetch('api/flows/details', {
            method: 'POST',
            body: JSON.stringify({
                flowNames
            }),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
        const detailResponse = await rawDetailResponse.json();
        const newDetails = detailResponse.flows.map((f) => {
            const summary = this.flowSummaryList.find((s) => s.fullName === f.fullName);
            return {
                ...f,
                formattedLastModifiedDate: new Date(summary.lastModifiedDate).toLocaleString(),
                lastModifiedByName: summary.lastModifiedByName
            };
        });
        console.log(newDetails);
        if (this.hasFlowList) {
            console.log('add');
            Array.prototype.push.apply(this.flowList, newDetails);
            console.log(this.flowList.length);
        } else {
            console.log('new');
            this.flowList = newDetails;
        }
    }

    get hasMore() {
        return this.flowSummaryList.length > this.flowList.length;
    }

    get hasFlowList() {
        return this.flowList && this.flowList.length !== 0;
    }

    get isEmpty() {
        return this.flowList && this.flowList.length === 0;
    }

    get flowCount() {
        return this.flowSummaryList ? this.flowSummaryList.length : 0;
    }

    get loadedCount() {
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
            .then((response) => {
                return response.json().then((json) => {
                    return response.ok ? json : Promise.reject(json);
                });
            })
            .then((docDefinition) => {
                pdfMake.createPdf(docDefinition).open();
            })
            .catch((error) => {
                this.errorStack = error.error;
                const modal = this.template.querySelector('ui-error-toast');
                modal.open();
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
            .then((response) => {
                return response.json().then((json) => {
                    return response.ok ? json : Promise.reject(json);
                });
            })
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
            .catch((error) => {
                this.errorStack = error.error;
                const modal = this.template.querySelector('ui-error-toast');
                modal.open();
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
