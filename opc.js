const opcua = require("node-opcua");

const options = {
  endpoint_must_exist: false,
  keepSessionAlive: true,
  allowAnonymous: true,
};
const client = opcua.OPCUAClient.create(options);
// const endpointUrl = "opc.tcp://192.168.10.20:4840"
var endpointUrl = "opc.tcp://192.168.1.149:4840";

async function main() {
  try {
    // step 1 : connect to
    console.log("trying to connect to " + endpointUrl);
    await client.connect(endpointUrl);
    console.log(" connected to ", endpointUrl);

    // step 2 : createSession

    const session = await client.createSession();
    console.log("session created !");

    // step 5: install a subscription and install a monitored item for 10 seconds
    const subscription = opcua.ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 6000,
      requestedMaxKeepAliveCount: 20,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,
    });

    function identifier(id) {
      const str = id.substring(id.indexOf(".") + 13);
      return str;
    }
    async function MonitorItem(id) {
      var itemToMonitor = {
        nodeId: id,
        attributeId: opcua.AttributeIds.Value,
      };
      const parameters = {
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 100,
      };

      var msgSend = identifier(id);
      var monitoredItem = await subscription.monitor(
        itemToMonitor,
        parameters,
        opcua.TimestampsToReturn.Both
      );
      monitoredItem.on("changed", (dataValue) => {
        console.log(" value has changed : ", dataValue.value.value);
        var msg = [msgSend, dataValue.value.value];
        process.send(msg);
      });
    }
    MonitorItem(
      "ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.PLC_PRG.hei"
    );

    process.on("message", (m) => {
      test(m[0], m[1]);
    });
    async function test(id, value) {
      await session.writeSingleNode(
        "ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application." + id,
        value
      );
    }

    async function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await timeout(3600000);

    console.log("now terminating subscription");
    await subscription.terminate();

    // close session
    await session.close();

    // disconnecting
    await client.disconnect();
    console.log("done !");
  } catch (err) {
    console.log("An error has occured : ", err);

    // close session
    await client.close();

    // disconnecting
    await client.disconnect();
    console.log("done !");
  }
}
main();
