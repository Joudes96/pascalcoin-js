const Abstract = require('./Abstract');

const ByteCollection = require('./../ByteCollection');
const PublicKey = require('./../Keys/PublicKey');

const AccountNumber = require('./../Types/AccountNumber');

const P_ACCOUNT_SIGNER = Symbol('account_signer');
const P_ACCOUNT_TARGET = Symbol('account_target');
const P_NEW_PUBLIC_KEY = Symbol('new_public_key');

/**
 * A transaction object that can be signed.
 */
class ChangeKeySigned extends Abstract {
  /**
     * Gets the optype.
     *
     * @returns {number}
     */
  static get OPTYPE() {
    return 7;
  }

  /**
     *
     * @param {Account|AccountNumber|Number|String} accountSigner
     * @param {Account|AccountNumber|Number|String}accountTarget
     * @param newPublicKey
     */
  constructor(accountSigner, accountTarget, newPublicKey) {
    super();
    this[P_ACCOUNT_SIGNER] = new AccountNumber(accountSigner);
    this[P_ACCOUNT_TARGET] = new AccountNumber(accountTarget);
    this[P_NEW_PUBLIC_KEY] = newPublicKey;
  }

  /**
     * Gets the digest of the operation.
     *
     * @returns {ByteCollection}
     */
  digest() {
    let bc = this.bcFromInt(this[P_ACCOUNT_SIGNER].account, 4);
    if (!this[P_ACCOUNT_SIGNER].equals(this[P_ACCOUNT_TARGET])) {
      bc = bc.append(this.bcFromInt(this[P_ACCOUNT_TARGET].account, 4));
    }
    return ByteCollection.concat(
      bc,
      this.bcFromInt(this.nOperation, 4),
      this.bcFromInt(this.fee.toMolina(), 8),
      this.payload,
      this.bcFromInt(PublicKey.empty().curve.id, 2), // just zero as curve id
      this[P_NEW_PUBLIC_KEY].encode(),
      this.bcFromInt(ChangeKeySigned.OPTYPE),
    );
  }

  /**
     * Gets the raw implementation.
     *
     * @returns {ByteCollection}
     */
  toRaw() {
    return ByteCollection.concat(
      this.bcFromInt(ChangeKeySigned.OPTYPE, 4),
      this.bcFromInt(this[P_ACCOUNT_SIGNER].account, 4),
      this.bcFromInt(this[P_ACCOUNT_TARGET].account, 4),
      this.bcFromInt(this.nOperation, 4),
      this.bcFromInt(this.fee.toMolina(), 8),
      this.bcFromBcWithSize(this.payload),
      PublicKey.empty().encode(),
      this[P_NEW_PUBLIC_KEY].encode(),
      this.bcFromSign(this.r, this.s),
    );
  }
}

module.exports = ChangeKeySigned;
