import { LightningElement, api } from 'lwc';

export default class ErrorToast extends LightningElement {
    isOpen = false;
    @api stack;

    @api open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }
}
