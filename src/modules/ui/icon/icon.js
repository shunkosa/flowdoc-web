import { LightningElement, api } from 'lwc';

export default class Icon extends LightningElement {
    @api category;
    @api name;
    @api size;
    @api type;

    get styleClass() {
        const base = `slds-icon_container slds-icon-${this.category}-${this.name}`;
        return this.type === 'button' ? `${base} slds-current-color` : base;
    }

    get sizeClass() {
        if (this.size === 'header') {
            return 'slds-icon slds-page-header__icon';
        } else if (this.size === 'x-small') {
            return 'slds-icon slds-icon_x-small';
        }
        return 'slds-icon';
    }

    get iconUrl() {
        return `assets/slds/icons/${this.category}-sprite/svg/symbols.svg#${this.name}`;
    }
}
