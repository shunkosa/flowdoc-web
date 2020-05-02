import { LightningElement, wire } from 'lwc';
import getSession from 'api/getSession';
export default class App extends LightningElement {
    @wire(getSession)
    session;

    get isList() {
        return document.location.toString().includes('/flows');
    }
    get hasSession() {
        if (this.session && this.session.data) {
            return this.session.data.hasSession;
        }
        return false;
    }
}
