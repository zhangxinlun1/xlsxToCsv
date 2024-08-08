const csv = require("csvtojson");
let moment = require("moment");
const Json2csvParser = require("json2csv").Parser;
let fs = require("fs");
const lodash = require("lodash");
const iconv = require("iconv-lite");
let Result = [];
csv()
    .fromFile("./7月抖音排班表.csv")
    .then((json) => {
        json.forEach((item) => {
            let begin = forMat(item.date, item.begin);
            let end = forMat(item.date, item.end);
            let result = {
                begin: begin,
                end: end,
                name: item.name,
                dbo: item.dbo,
            };
            Result.push(result);
        });
        csv()
            .fromFile("./抖音7月结算.csv")
            .then((json) => {
                let data = [];
                json.map((item, itemIndex) => {
                    let itemResult = moment(item.下单时间).unix();
                    let username = "未知";
                    let dbo = "";
                    let min;
                    Result.forEach((result, index) => {
                        if (result.begin <= itemResult && result.end >= itemResult) {
                            username = result.name;
                            dbo = result.dbo;
                        } else if (itemResult > result.end) {
                            if (username == '未知' && !min) {
                                min = itemResult - result.end
                                username = result.name
                                dbo = result.dbo
                            } else {
                                if (itemResult - result.end < min) {
                                    username = result.name;
                                    min = itemResult - result.end;
                                    dbo = result.dbo;
                                }
                            }
                        }
                    });

                    data.push({ 下单时间: item.下单时间, 运营: dbo, username, ...item });
                })
                data = toGbkCsv(data)
                fs.writeFileSync("./7月抖音完整订单结果.csv", data, 'binary');
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