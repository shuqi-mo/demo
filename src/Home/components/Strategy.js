import { useRef, useEffect } from "react";
import * as echarts from "echarts";
import "../index.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrushArea } from "../../store/modules/stock";

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
  function calculateBOLLUP(dayCount, data) {
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
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += +(data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA + 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateBOLLDOWN(dayCount, data) {
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
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += (data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA - 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateRSI(dayCount, dasta) {
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
    return result;
  }
  function calculateKDJ(dayCount, data, type) {
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
      return k;
    } else if (type === 2) {
      return d;
    } else {
      return j;
    }
  }
  useEffect(() => {
    const myChart = echarts.init(chartRef.current);
    const option = {
      legend: {
        data: [
          "MA30",
        //   "MA50",
        //   "MA100",
        //   "MA200",
        //   "BOLL_MID",
        //   "BOLL_UP",
        //   "BOLL_DOWN",
        //   "RSI",
        //   "K",
        //   "D",
        //   "J",
        ],
        inactiveColor: "#777",
        bottom: 10,
        left: "center",
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
        // {
        //   name: "MA50",
        //   type: "line",
        //   data: calculateMA(50, data, brushArea[0], brushArea[1]),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "MA100",
        //   type: "line",
        //   data: calculateMA(100, data, brushArea[0], brushArea[1]),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "MA200",
        //   type: "line",
        //   data: calculateMA(200, data, brushArea[0], brushArea[1]),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "BOLL_MID",
        //   type: "line",
        //   data: calculateMA(9, data.slice(brushArea[0], brushArea[1] + 1)),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "BOLL_UP",
        //   type: "line",
        //   data: calculateBOLLUP(9, data.slice(brushArea[0], brushArea[1] + 1)),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "BOLL_DOWN",
        //   type: "line",
        //   data: calculateBOLLDOWN(9, data.slice(brushArea[0], brushArea[1] + 1)),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "RSI",
        //   type: "line",
        //   data: calculateRSI(14, data.slice(brushArea[0], brushArea[1] + 1)),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "K",
        //   type: "line",
        //   data: calculateKDJ(9, data.slice(brushArea[0], brushArea[1] + 1), 1),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "D",
        //   type: "line",
        //   data: calculateKDJ(9, data.slice(brushArea[0], brushArea[1] + 1), 2),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
        // {
        //   name: "J",
        //   type: "line",
        //   data: calculateKDJ(9, data.slice(brushArea[0], brushArea[1] + 1), 3),
        //   smooth: true,
        //   showSymbol: false,
        //   lineStyle: {
        //     width: 1,
        //   },
        // },
      ],
    };
    myChart.setOption(option);
  }, [dates, data, brushArea]);
  return <div ref={chartRef} style={style}></div>;
};

export { Strategy };
