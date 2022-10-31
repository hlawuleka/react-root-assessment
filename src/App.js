import { useEffect, useState } from "react";
import _ from "lodash";
import moment from "moment-timezone";
import "./styles.css";
import axios from "axios";

export default function App() {
  const xAxisLabels = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];
  const xAxisGrid = Array(16).fill("x");
  const yAxisGrid = [...xAxisLabels];

  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const [parkData, setparkData] = useState([]);

  useEffect(() => {
    const fetchParkData = async () => {
      const requestParkData = (
        await axios.get(
          "https://5rz6r1it73.execute-api.eu-west-2.amazonaws.com/nudls/feed"
        )
      ).data;

      setparkData(requestParkData);
      return requestParkData;
    };

    fetchParkData().catch((err) => console.error("Fetch Error ", err.message));
  }, []);

  let locations = {};

  const checkDinoStatus = (locator) => {
    parkData.map((dino) => {
      if (locator) {
        if (locator.toString().toLowerCase() === dino.location?.toLowerCase()) {
          const isSafe =
            !dino.herbivore &&
            dino?.digestion_period_in_hours &&
            moment().diff(moment(dino.time), "hours") >=
              dino?.digestion_period_in_hours;

          locations[locator] = {
            location: locator,
            isSafe,
            maintain:
              moment(dino.time).isSameOrAfter(moment()) &&
              dino.kind !== "maintenance_performed"
          };
        }
      }
      return true;
    });
  };

  return (
    <>
      <div className="logo">
        <img src="dinoparks-logo.png" alt="logo'" />
      </div>
      <div className="grid-parent--container">
        <div className="grid-header">
          <div className="park-name">Park Zones</div>
          <div className="date-label">
            {new Date().getDate() +
              " " +
              month[new Date().getMonth()] +
              " " +
              new Date().getFullYear()}
          </div>
        </div>
        <div className="grid-container">
          <div className="y-axis-label">
            {xAxisGrid.map((axixLabel, index) => (
              <div key={_.uniqueId(axixLabel)}>{index + 1}</div>
            ))}
          </div>
          <div className="parent-grid">
            {yAxisGrid.map((outer, index) => (
              <>
                <div key={_.uniqueId(outer)}>
                  {xAxisGrid.map((inner, innerIndex) => (
                    <>
                      {checkDinoStatus(`${outer}${innerIndex}`)}
                      <div
                        key={_.uniqueId(inner)}
                        className={`grid-x-axis ${
                          parkData &&
                          parkData.length &&
                          locations[`${outer}${innerIndex}`]?.isSafe
                            ? "safe"
                            : ""
                        } ${
                          parkData &&
                          parkData.length &&
                          locations[`${outer}${innerIndex}`]?.isSafe
                            ? "unsafe"
                            : ""
                        } ${
                          parkData &&
                          parkData.length &&
                          locations[`${outer}${innerIndex}`]?.maintain
                            ? "needs--maintenance"
                            : ""
                        }`}
                      >
                        {parkData &&
                          parkData.length &&
                          locations[`${outer}${innerIndex}`]?.maintain && (
                            <img src="dino-parks-wrench.png" alt="logo'" />
                          )}
                      </div>
                    </>
                  ))}
                  <span className="x-axis-label">{outer.toUpperCase()}</span>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
