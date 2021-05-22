const opcua = require("node-opcua");

const options = {
  endpoint_must_exist: false,
  keepSessionAlive: true,
  allowAnonymous: true, 
};
const client = opcua.OPCUAClient.create(options);
// const endpointUrl = "opc.tcp://192.168.10.20:4840"
var endpointUrl = "opc.tcp://192.168.10.184:4840";

async function main() {
  try {
    // step 1 : connect to
    console.log("trying to connect to " + endpointUrl);
    await client.connect(endpointUrl);
    console.log(" connected to ", endpointUrl);

    // step 2 : createSession

    const session = await client.createSession();
    console.log("session created !");

    // step 3: install a subscription 
    const subscription = opcua.ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 6000,
      requestedMaxKeepAliveCount: 20,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,
    });

    //step 4: Monitor Items

    //function deletes the first 13 characters of a string
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
      //Read function
      monitoredItem.on("changed", (dataValue) => {
        var msg = [msgSend, Math.floor(dataValue.value.value*10)/10];
        console.log(" value has changed for: ",msg[0], msg[1]);
        process.send(msg);
      });
    }
    //INPUT ALL ITEMS FOR MONITORING
    //Control system
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.iDirection");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.iActualDir");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.iDestination");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.rCurrent");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.rSTW");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.iCurrentDir");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AutoPilot");
    
    //Engine
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.BowThruster_Effect");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AftThruster_Effect");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.BowThruster_Temp");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AftThruster_Temp");

    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AzimuthStarboard_Effect");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AzimuthStarboard_Angle");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AzimuthStarboard_Temp");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.AzimuthStarboard_OilPressure");

    // Tank Control
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.Level_Tank1");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.Temperature_Tank1");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.Level_Reserve1");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.Temperature_Reserve1");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.rPump_Tank1");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.rPump_Reserve1");
    
 
   

    //Tanks
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.TemperedTank1_Level");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.TemperedTank1_Temp");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.TemperedTank1_Heat");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.TemperedTank1_PumpOn");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.GVL.TemperedTank1_PumpEffect");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Tempered_Tank.Set_Temp_1.VMan");

    //Lights
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_1.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_2.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_3.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_4.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_5.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_6.VMan");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Search_Lights.Light_Switch_7.VMan");

    //ALARM
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Tank_Control.Level_Tank1_Mon.VALAct");
    MonitorItem("ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application.Tank_Control.Level_Tank1_Mon.VWLAct");

    //ON MESSAGE
    process.on("message", (m) => {
      SendPLC(m[0], m[1]);
    });

    //Write function
    async function SendPLC(id, value) {
      await session.writeSingleNode(
        "ns=4;s=|var|WAGO 750-8212 PFC200 G2 2ETH RS.Application." + id,
        value
      );
    }
    //Terminate connection after 1 hour.
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

    console.log("Session was terminated !");
  }
}
main();
