import { useRef, useEffect } from "react";
import * as echarts from "echarts";
import "../index.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrushArea } from "../../store/modules/stock";
import { Card } from "antd";

const Strategy = ({
  dates,
  data,
  style = { width: "800px", height: "400px" },
}) => {
  const { brushArea } = useSelector((state) => state.stock);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchBrushArea());
  }, [dispatch]);
  const chartRef = useRef(null);
  function calculateMA(dayCount, data, start, end) {
    var result = [];
    for (var i = start; i < end + 1; i++) {
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }
  function calculateBOLLUP(dayCount, data, start, end) {
    var result = [];
    for (var i = start; i < end + 1; i++) {
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += +(data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA + 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateBOLLDOWN(dayCount, data, start, end) {
    var result = [];
    for (var i = start; i < end + 1; i++) {
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += (data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA - 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateRSI(dayCount, data, start, end) {
    var result = [];
    var gain = [];
    var loss = [];
    for (var i = 1, len = data.length; i < len; i++) {
      if (data[i][1] - data[i - 1][1] > 0) {
        gain.push(data[i][1] - data[i - 1][1]);
        loss.push(0);
      } else {
        gain.push(0);
        loss.push(data[i - 1][1] - data[i][1]);
      }
    }
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount + 1) {
        result.push("-");
        continue;
      }
      var sumGain = 0;
      var sumLoss = 0;
      for (var j = 0; j < dayCount; j++) {
        sumGain += +gain[i - j];
        sumLoss += +loss[i - j];
      }
      result.push(((sumGain / (sumGain + sumLoss)) * 100).toFixed(2));
    }
    return result.slice(start, end + 1);
  }
  function calculateKDJ(dayCount, data, type, start, end) {
    var k = [];
    var d = [];
    var j = [];
    for (var i = 0, len = data.length; i < len; i++) {
      var c = data[i][1];
      if (i < dayCount) {
        k.push(50);
        d.push(50);
        j.push(50);
        continue;
      }
      var l = data[i][2];
      var h = data[i][3];
      for (var r = 1; r < dayCount + 1; r++) {
        if (data[i - r][2] < l) {
          l = data[i - r][2];
        }
        if (data[i - r][3] > h) {
          h = data[i - r][3];
        }
      }
      var rsv = ((c - l) / (h - l)) * 100;
      var currentK = rsv / 3 + (k[i - 1] * 2) / 3;
      k.push(currentK.toFixed(2));
      var currentD = currentK / 3 + (d[i - 1] * 2) / 3;
      d.push(currentD.toFixed(2));
      j.push((3 * currentD - 2 * currentK).toFixed(2));
    }
    if (type === 1) {
      return k.slice(start, end + 1);
    } else if (type === 2) {
      return d.slice(start, end + 1);
    } else {
      return j.slice(start, end + 1);
    }
  }

  function buyPoint(data, start, end) {
    var res = [];
    var MA30 = calculateMA(30, data, start, end);
    var MA50 = calculateMA(50, data, start, end);
    for (var i = 0; i < end - start; i++) {
      if (+MA30[i] < +MA50[i] && +MA30[i + 1] > +MA50[i + 1]) {
        res.push([i, +data[start + i][1]]);
      }
    }
    return res;
  }

  function sellPoint(data, start, end) {
    var res = [];
    var MA30 = calculateMA(30, data, start, end);
    var MA50 = calculateMA(50, data, start, end);
    for (var i = 0; i < end - start; i++) {
      if (+MA30[i] > +MA50[i] && +MA30[i + 1] < +MA50[i + 1]) {
        res.push([i, +data[start + i][1]]);
      }
    }
    return res;
  }

  useEffect(() => {
    if (!data.length) return;
    const myChart = echarts.init(chartRef.current);
    const option = {
      title: {
        text: 'Brush View',
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        data: [
          "MA30",
          "MA50",
          "MA100",
          "MA200",
          "BOLL_MID",
          "BOLL_UP",
          "BOLL_DOWN",
          "RSI",
          "K",
          "D",
          "J",
        ],
        inactiveColor: "#777",
        bottom: 10,
        left: "center",
        selected: {
          MA30: true,
          MA50: true,
          MA100: true,
          MA200: true,
          BOLL_MID: true,
          BOLL_UP: true,
          BOLL_DOWN: true,
          RSI: false,
          K: false,
          D: false,
          J: false,
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false,
          type: "cross",
          lineStyle: {
            color: "#376df4",
            width: 2,
            opacity: 1,
          },
        },
      },
      xAxis: {
        type: "category",
        data: dates.slice(brushArea[0], brushArea[1] + 1),
        axisLine: { lineStyle: { color: "#8392A5" } },
      },
      yAxis: {
        scale: true,
        axisLine: { lineStyle: { color: "#8392A5" } },
        splitLine: { show: false },
      },
      grid: {
        bottom: 80,
      },
      //   dataZoom: [
      //     {
      //       textStyle: {
      //         color: "#8392A5",
      //       },
      //       handleIcon:
      //         "path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
      //       dataBackground: {
      //         areaStyle: {
      //           color: "#8392A5",
      //         },
      //         lineStyle: {
      //           opacity: 0.8,
      //           color: "#8392A5",
      //         },
      //       },
      //       brushSelect: true,
      //     },
      //     {
      //       type: "inside",
      //     },
      //   ],
      series: [
        {
          type: "candlestick",
          name: "Day",
          data: data.slice(brushArea[0], brushArea[1] + 1),
          itemStyle: {
            color: "#FD1050",
            color0: "#0CF49B",
            borderColor: "#FD1050",
            borderColor0: "#0CF49B",
          },
          markPoint: {
            data: (function () {
              const res = [];
              const buy = buyPoint(data, brushArea[0], brushArea[1]);
              const sell = sellPoint(data, brushArea[0], brushArea[1]);
              let len = buy.length;
              while (len--) {
                res.push({
                  name: "buy",
                  value: "buy",
                  xAxis: buy[len][0],
                  yAxis: buy[len][1],
                });
              }
              len = sell.length;
              while (len--) {
                res.push({
                  name: "sell",
                  value: "sell",
                  xAxis: sell[len][0],
                  yAxis: sell[len][1],
                  itemStyle: {
                    color: "green",
                  },
                });
              }
              return res;
            })(),
          },
        },
        {
          name: "MA30",
          type: "line",
          data: calculateMA(30, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA50",
          type: "line",
          data: calculateMA(50, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA100",
          type: "line",
          data: calculateMA(100, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA200",
          type: "line",
          data: calculateMA(200, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_MID",
          type: "line",
          data: calculateMA(9, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_UP",
          type: "line",
          data: calculateBOLLUP(9, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: "rgb(215,225,252)",
            opacity: 0.5,
          },
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_DOWN",
          type: "line",
          data: calculateBOLLDOWN(9, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: "white",
            opacity: 1,
          },
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "RSI",
          type: "line",
          data: calculateRSI(14, data, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "K",
          type: "line",
          data: calculateKDJ(9, data, 1, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "D",
          type: "line",
          data: calculateKDJ(9, data, 2, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "J",
          type: "line",
          data: calculateKDJ(9, data, 3, brushArea[0], brushArea[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
      ],
    };
    myChart.setOption(option);
  }, [dates, data, brushArea]);
  return (
    <div>
      <div ref={chartRef} style={style}></div>
      <Card
        size="small"
        title="Strategy View"
        extra={<a href="#">More</a>}
        style={{
          width: 800,
        }}
      >
        <p>Buy: Golden Cross - MA30 & MA50</p>      
        <p>Sell: Dead Cross - MA30 & MA50</p> 
      </Card>
    </div>
  );
};

export { Strategy };
