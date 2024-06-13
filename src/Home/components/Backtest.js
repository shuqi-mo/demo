import { useRef, useEffect } from "react";
import * as echarts from "echarts";
import "../index.scss";
import { Card } from "antd";

const BackTestChart = ({
  dates,
  data,
  style = { width: "1600px", height: "220px" },
}) => {
  const chartRef = useRef(null);

  function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }

  function buyPoint(data) {
    var res = [];
    var MA30 = calculateMA(30, data);
    var MA50 = calculateMA(50, data);
    for (var i = 0, len = data.length; i < len; i++) {
      if (+MA30[i] < +MA50[i] && +MA30[i + 1] > +MA50[i + 1]) {
        res.push([i, +data[i][1]]);
      }
    }
    return res;
  }

  function sellPoint(data) {
    var res = [];
    var MA30 = calculateMA(30, data);
    var MA50 = calculateMA(50, data);
    for (var i = 0, len = data.length; i < len; i++) {
      if (+MA30[i] > +MA50[i] && +MA30[i + 1] < +MA50[i + 1]) {
        res.push([i, +data[i][1]]);
      }
    }
    return res;
  }

  function calculateReturn(data) {
    var res = [];
    var buy = buyPoint(data);
    var sell = sellPoint(data);
    while (buy.length > 0 && sell.length > 0) {
      console.log(buy);
      console.log(sell);
      var buyTimes = 0;
      var sellTimes = 0;
      var profit = 0;
      var finish = 0;
      // sellTimes初始化：定位到第一个买点后
      while (sell[sellTimes][0] < buy[0][0]) {
        sellTimes++;
      }
      for (var i = 0, len = data.length; i < len; i++) {
        if (i < sell[sellTimes][0] || finish) {
          res.push(profit);
          continue;
        } else {
          var buyPrice = buy[buyTimes][1];
          var sellPrice = sell[sellTimes][1];
          profit += sellPrice - buyPrice;
          res.push(profit);
          console.log("buy: " + buy[buyTimes][0] + " buyTimes: " + buyTimes);
          console.log(
            "sell: " + sell[sellTimes][0] + " sellTimes: " + sellTimes
          );
          // 更新下一次买入点
          while (buy[buyTimes][0] < sell[sellTimes][0]) {
            buyTimes++;
            if (buyTimes >= buy.length) {
              buyTimes--;
              finish = 1;
              break;
            }
          }
          // 更新下一次卖出点
          while (sell[sellTimes][0] < buy[buyTimes][0]) {
            sellTimes++;
            if (sellTimes >= sell.length) {
              sellTimes--;
              finish = 1;
              break;
            }
          }
        }
        // res.push(+data[i][1]);
      }
      break;
    }
    return res;
  }

  useEffect(() => {
    // 1. 生成实例
    const myChart = echarts.init(chartRef.current);
    // 2. 准备图表参数
    const option = {
      legend: {
        bottom: 20
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "8%",
        bottom: 100,
        containLabel: true,
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          minValueSpan: 10,
        },
        {
          show: true,
          type: "slider",
          bottom: 60,
          start: 98,
          end: 100,
          minValueSpan: 10,
        },
      ],
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#8392A5" } },
      },
      yAxis: {
        scale: true,
        axisLine: { lineStyle: { color: "#8392A5" } },
      },
      series: [
        {
          name: "Return",
          type: "line",
          data: calculateReturn(data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
      ],
    };
    // 3. 渲染参数
    myChart.setOption(option);
  }, [dates, data]);
  return (
    <div>
      <Card
        size="small"
        title="Back Testing View"
        style={{
          width: 1600,
        }}
      >
        <div className="performanceview">
          {/* <div className="performance">策略收益</div>
          <div className="performance">策略年化收益</div>
          <div className="performance">超额收益</div>
          <div className="performance">基准收益</div>
          <div className="performance">策略波动率</div>
          <div className="performance">基准波动率</div>
          <div className="performance">盈利次数</div>
          <div className="performance">亏损次数</div>
          <div className="performance">胜率</div>
          <div className="performance">盈亏比</div>
          <div className="performance">最大回撤</div>
          <div className="performance">夏普比率</div> */}
        </div>
        <div ref={chartRef} style={style}></div>
      </Card>
    </div>
  );
};

export { BackTestChart };
