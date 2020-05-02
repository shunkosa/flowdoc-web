import { LightningElement, track } from 'lwc';

export default class Format extends LightningElement {
    @track selectedFormat = 'pdf';

    connectedCallback() {
        this.dispatch();
    }

    handleClick() {
        const options = this.template.querySelectorAll('input[name="format"]');
        this.selectedFormat = Array.from(options).filter((o) => o.checked)[0].value;
        this.dispatch();
    }

    dispatch() {
        const formatEvent = new CustomEvent('format', { detail: this.selectedFormat });
        this.dispatchEvent(formatEvent);
    }
}
