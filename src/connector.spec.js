const expect = require("chai").expect;
const CacheConnector = require("./connector");
const EventEmitter = require("events").EventEmitter;

const settings = {
  mapName: "deepstreamCache",
  networkConfig: {
    addresses: ["localhost"],
    connectionAttemptLimit: 1,
    connectionTimeout: 2000,
  },
};

const wrongSettings = {
  mapName: "deepstreamCache",
  networkConfig: {
    addresses: ["wrong-address"],
    connectionAttemptLimit: 1,
    connectionTimeout: 1000,
  },
};

describe("the message connector has the correct structure", () => {
  var cacheConnector;

  it("throws an error if required connection parameters are missing", () => {
    expect(() => {
      cacheConnector = new CacheConnector("gibberish");
    }).to.throw();

    expect(() => {
      cacheConnector = new CacheConnector({});
    }).to.throw();
  });

  it("emits an error event if connection fails", (done) => {
    var errorThrown = false;

    cacheConnector = new CacheConnector(wrongSettings);

    expect(cacheConnector.isReady).to.equal(false);

    cacheConnector.on("ready", () => {
      done( "ready event should't have been called" );
    });

    cacheConnector.on("error", () => {
      if (!errorThrown) { done(); }
      errorThrown = true;
    } );
  });

  it("creates the cacheConnector", (done) => {
    cacheConnector = new CacheConnector(settings);

    expect(cacheConnector.isReady).to.equal(false);

    cacheConnector.on("error", done );

    cacheConnector.on("ready", () => {
      expect(cacheConnector.isReady).to.equal(true);
      done();
    });
  });

  it("implements the cache/storage connector interface", () => {
    expect(typeof cacheConnector.name).to.equal("string");
    expect(typeof cacheConnector.version).to.equal("string");
    expect(typeof cacheConnector.get).to.equal("function");
    expect(typeof cacheConnector.set).to.equal("function");
    expect(typeof cacheConnector.delete).to.equal("function");

    expect(cacheConnector instanceof EventEmitter).to.equal(true);
  });

  it("retrieves a non existing value", (done) => {
    cacheConnector.get("someValue", (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.equal(null);
      done();
    });
  });

  it("sets a value", (done) => {
    cacheConnector.set("someValue", { firstname: "Wolfram" }, (error) => {
      expect(error).to.equal(null);
      done();
    });
  });

  it("retrieves an existing value", (done) => {
    cacheConnector.get("someValue", (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.deep.equal({ firstname: "Wolfram" });
      done();
    });
  });

  it("deletes a value", (done) => {
    cacheConnector.delete("someValue", (error) => {
      expect(error).to.equal(null);
      done();
    });
  });

  it("Can't retrieve a deleted value", (done) => {
    cacheConnector.get("someValue", (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.equal(null);
      done();
    });
  });
});
