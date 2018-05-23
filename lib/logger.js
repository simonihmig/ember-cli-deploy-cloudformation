class MappingLogger {
  constructor(logFn) {
    this._log = logFn;
  }

  log(msg) {
    this._log(msg);
  }

  error(msg) {
    this._log(msg, { color: 'red' });
  }

  debug(msg) {
    this._log(msg, { verbose: true });
  }
}

module.exports = MappingLogger;
