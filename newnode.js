const csv = require("csvtojson");
let moment = require("moment");
const Json2csvParser = require("json2csv").Parser;
let fs = require("fs");
const lodash = require("lodash");
const iconv = require("iconv-lite");
let result = []
csv()
    .fromFile("./67月订单.csv")
    .then((order) => {
        order.forEach((item) => {
            //.replace(",",'')
            result.push({order:item.order})
        });
        csv()
            .fromFile("./抖音7月结算.csv")
            .then((json) => {
                let data = [];
                json.forEach((res)=>{
                    result.forEach((item,index) => {
                        if(res.子订单号.replace("'",'')==item.order.replace("\t","")){
                            data.push({  ...res, dyOrder:`'${res.子订单号}`});
                        }
                    });
                })
                data = toGbkCsv(data)
                fs.writeFileSync("./dydydy7月订单.csv", data, 'binary');
            });
    });

function forMat(date, begin) {
    date = date.replace(/年/g, "/");
    date = date.replace(/月/g, "/");
    date = date.replace(/日/g, "");
    date = date + " " + begin;
    date = moment(date).unix();
    return date;
}

function toGbkCsv(data) {
    if (data.length === 0) return "";
    const safeData = data.map((row) =>
        lodash.mapValues(row, (v) => {
            if (typeof v === "string")
                return v.replace(/,/g, "").replace(/\r\n/g, "").replace(/\n/g, "");
            return v;
        })
    );
    const csv = [
        Object.keys(safeData[0]).join(","),
        ...safeData.map((row) => Object.values(row).join(",")),
    ].join("\n");
    return iconv.encode(csv, "gbk");
}

// 指定头部
// const fields = ["order", "username"];
// const json2csvParser = new Json2csvParser({ fields });
// let result = json2csvParser.parse(data);
