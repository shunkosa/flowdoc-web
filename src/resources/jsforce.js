import jsforce from "jsforce";

class JSForce {
    constructor(instanceUrl, accessToken) {
        this.conn = new jsforce.Connection({
            instanceUrl: instanceUrl,
            accessToken: accessToken,
            version: "48.0"
        });
    }

    async getFlowList() {
        const flowList = await this.conn.metadata.list({ type: 'Flow' }, '48.0');
        const chunkedFullNames = this.chunk(
            flowList.map((f) => f.fullName),
            10
        );
        let detailedFlowList = [];
        for (const fullNames of chunkedFullNames) {
            // eslint-disable-next-line no-await-in-loop
            const result = await this.conn.metadata.read('Flow', fullNames);
            detailedFlowList = Array.isArray(result)
                ? [...detailedFlowList, ...result]
                : [...detailedFlowList, result];
        }
        for (const f of flowList) {
            f.formattedLastModifiedDate = new Date(
                f.lastModifiedDate
            ).toLocaleString();
            for (const d of detailedFlowList) {
                if (f.fullName === d.fullName) {
                    f.detail = d;
                    break;
                }
            }
        }
        return flowList;
    }

    chunk([...array], size = 1) {
        return array.reduce((acc, value, index) => index % size ? acc : [...acc, array.slice(index, index + size)], []);
    }
}

export default JSForce;