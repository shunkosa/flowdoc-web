import { LightningElement, track } from 'lwc';
import JSForce from '../../../resources/jsforce';

export default class List extends LightningElement {
    @track message = 'Loading...';
    @track isLoading = true;
    @track flowList;

    connectedCallback() {
        (async () => {
            const jsforce = new JSForce(this.getCookie('instance_url'), this.getCookie('access_token'));
            this.flowList = await jsforce.getFlowList();
            this.isLoading = false;
        })();
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) { 
            return parts.pop().split(";").shift();
        }
        return undefined;
    }

    chunk([...array], size = 1) {
        return array.reduce((acc, value, index) => index % size ? acc : [...acc, array.slice(index, index + size)], []);
    }
}
