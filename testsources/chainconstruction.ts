import * as chai from "chai";
import { Cancel, CancelSymbol, CancelableChain } from "../built/commonjs/cancelable";

describe("CancelableChain", () => {
    it("should be constructed successfully", () => {
        chai.assert(new CancelableChain() instanceof CancelableChain, "new CancelableChain() is instance of CancelableChain");
    });

    it("should use cancel symbol", (done) => {
        const stub = {
            [CancelSymbol]() {
                done();
            }
        }
        const chain = new CancelableChain();
        chain(stub);
        chain.cancel();
        chai.assert(chain.canceled, ".canceled should be true");
    });

    it("should be called", done => {
        const chain = new CancelableChain();
        let canceled = false;
        chai.assert(chain.tillCanceled instanceof Promise, "tillCanceled should exist");
        chain.tillCanceled.then(() => {
            chai.assert(canceled, "tillCanceled should be resolved after cancel() call");
            done();
        });
        setTimeout(() => {
            chain.cancel();
            canceled = true;
        }, 0);
    });

    it("should throw", done => {
        const chain = new CancelableChain();
        setTimeout(() => {
            try {
                chain.throwIfCanceled();
            }
            catch (c) {
                chai.assert(c instanceof Cancel, "A cancel object should be instance of Cancel")
                done();
            }
        })
        chain.cancel();
    });

    it("should not throw", done => {
        const chain = new CancelableChain();
        setTimeout(() => {
            try {
                chain.throwIfCanceled();
                done();
            }
            catch (err) { }
        })
    });

    it("should throw Cancel when cancellation is already requested", done => {
        const chain = new CancelableChain();
        const stub = {
            [CancelSymbol]() { }
        }

        chain.cancel();
        chai.assert(chain.canceled, "status should be 'canceled'");
        (async () => {
            try {
                await chain(stub);
            }
            catch (c) {
                chai.assert(c instanceof Cancel, "The thrown object should be an instance of Cancel");
                done();
            }
        })();
    })

    it("should just pass an uncancelable object", done => {
        const chain = new CancelableChain();

        const o = {};
        chain(o).then(pass => {
            chai.assert(pass === o, "should be same object");
            done();
        });
    });

    it("should just pass null", done => {
        (async () => {
            const chain = new CancelableChain();
            chai.assert(await chain(null) === null);
            done();
        })();
    });
})