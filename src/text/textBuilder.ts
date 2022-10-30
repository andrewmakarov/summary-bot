import nodeUtils from 'node:util';
import { IconSet } from './emoji';
import { bold } from './utils';

type TextStyleDecorator = (value: string) => string;

class TextBuilderAPI {
    private result = '';

    constructor(value: string = '') {
        this.result = value;
    }

    text(value: string, style?: TextStyleDecorator) {
        this.result += style ? style(value) : value;

        return this;
    }

    format(value: string, ...params: any[]) {
        this.result += nodeUtils.format(value, ...params);
        return this;
    }

    caption(value: string) {
        return this.text(value, bold).nextLine();
    }

    amount(value: number, currency: string, style?: TextStyleDecorator) {
        const formattedValue = new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value);
        return this.text(formattedValue + currency, style);
    }

    nextLine() {
        this.result += '\n';
        return this;
    }

    icon(icon: IconSet) {
        this.result += icon;
        return this;
    }

    rightIcon() {
        return this
            .space()
            .icon('➡️')
            .space();
    }

    space() {
        this.result += ' ';
        return this;
    }

    clone() {
        return new TextBuilderAPI(this.result);
    }

    done() {
        return this.result;
    }
}

export const textBuilder = () => new TextBuilderAPI();
