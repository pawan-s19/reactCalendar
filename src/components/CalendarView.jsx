import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimePicker from "react-bootstrap-time-picker";
import toast from "react-hot-toast";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import { v4 as uuidv4 } from "uuid";
import {
  formatTimeSlot,
  getCurrentTimeInSeconds,
  getHourFromSeconds,
} from "../utils/utils";
import { isToday } from "date-fns";

function CalendarView() {
  const [selected, setSelected] = useState(null);
  const [typeSelect, setTypeSelect] = useState("single");
  const [fromTime, setFromTime] = useState(32400);
  const [toTime, setToTime] = useState(fromTime + 3600);
  const [timeSlots, setTimeSlots] = useState([]);
  const [tableRow, setTableRow] = useState([]);
  const [show, setShow] = useState(false);
  const [dataHolder, setDataHolder] = useState([]);
  const [choosenDate, setChoosenDate] = useState(null);
  const [isChecked, setChecked] = useState(false);
  const [initialTime, setInitialTime] = useState(
    `${Math.floor(32400 / 3600)}:00`
  );

  const handleClose = () => {
    setShow(false);
    setChecked(false);
  };
  const handleShow = () => setShow(true);

  //Popup for adding time slots

  const Popup = () => {
    return (
      <>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Select Time Slots</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {" "}
            <div className="time-range">
              <div className="time-picker">
                <p>Starts</p>
                <TimePicker
                  start={initialTime}
                  end="21:00"
                  step={60}
                  onChange={(time) => {
                    setFromTime(time);
                    setToTime(time + 3600);
                  }}
                  value={fromTime}
                />
              </div>
              <div className="time-picker">
                <p>Ends</p>
                <TimePicker
                  start={`${Math.floor(Number(3600 + fromTime) / 3600)}:00`}
                  end={`${Math.floor(Number(3600 + fromTime) / 3600)}:00`}
                  step={60}
                  onChange={(time) => setToTime(time)}
                  value={toTime}
                />
              </div>
              <button className="btn btn-primary h-25" onClick={addTimeSlot}>
                Add
              </button>
            </div>
          </Modal.Body>
          <Modal.Footer className="me-auto">
            <div className="form-check">
              <input
                className="form-check-input border border-black"
                type="checkbox"
                checked={isChecked}
                id="flexCheckDefault"
                onChange={(e) => setChecked(!isChecked)}
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Select all time slots
              </label>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const dateSelectHandler = (date) => {
    setSelected(date);

    if (!Array.isArray(date)) date = [date];
    setDataHolder([...date]);
  };

  const selectHandler = (event) => {
    setSelected(null);
    setTypeSelect(event.target.value);
  };

  const disableHandler = (date) => {
    if (date < new Date().setHours(0, 0, 0, 0)) {
      return true;
    } else {
      return false;
    }
  };

  const addTimeSlot = () => {
    let validateArray = [...choosenDate.timeSlots];

    if (!isChecked) {
      for (let i = 0; i < validateArray.length; i++) {
        if (validateArray[i].type === "allSlots") {
          return toast.error(
            "All the time slots have already been selected already"
          );
        }
        if (
          toTime <= validateArray[i].to.value &&
          fromTime >= validateArray[i].from.value
        ) {
          return toast.error("Time slot already exists");
        }
      }
    }

    let arrData = [
      ...timeSlots,
      {
        from: { label: formatTimeSlot(fromTime), value: fromTime },
        to: { label: formatTimeSlot(toTime), value: toTime },
      },
    ];
    let newArray = tableRow;
    const index = newArray.findIndex((obj) => obj.id === choosenDate.id);

    if (index !== -1) {
      // Update the specific field in the found object
      if (isChecked) {
        newArray[index] = {
          ...newArray[index],
          timeSlots: [
            {
              from: { label: formatTimeSlot(fromTime), value: fromTime },
              to: { label: formatTimeSlot(79200), value: 79200 },
              id: uuidv4(),
              type: isChecked ? "allSlots" : "singleSlots",
            },
          ],
        };
      } else {
        newArray[index] = {
          ...newArray[index],
          timeSlots: [
            ...newArray[index].timeSlots,
            {
              from: { label: formatTimeSlot(fromTime), value: fromTime },
              to: { label: formatTimeSlot(toTime), value: toTime },
              id: uuidv4(),
              type: isChecked ? "allSlots" : "singleSlots",
            },
          ],
        };
      }

      setTimeSlots(arrData);
      // Set the state with the updated array
      setTableRow(newArray);
    }
    handleClose();
  };
  const addDates = () => {
    let arr = [];
    for (let i = 0; i < dataHolder.length; i++) {
      if (typeSelect === "range") {
        let todaySelected = isToday(dataHolder[i].from);
        if (new Date().getHours() > 9 && todaySelected)
          return toast.error(
            "Since, its past 9AM, please choose range starting from tommorow"
          );
      }
      arr.push({
        date: dataHolder[i],
        id: uuidv4(),
        timeSlots: [],
      });
    }
    setTableRow([...tableRow, ...arr]);
  };
  const handleTimeSlotAdd = (date) => {
    let initTimeToSet = getCurrentTimeInSeconds(
      date.date.from ? date.date.from : date.date
    );
    if (initTimeToSet >= 79200) return toast.error("Cannot select after 9PM");
    let secondsToAdd = isToday(date.date)
      ? initTimeToSet + 3600
      : initTimeToSet;

    let secondsVal = `${Math.floor(Number(secondsToAdd) / 3600)}:00`;

    setInitialTime(secondsVal);
    setFromTime(secondsToAdd);
    setToTime(secondsToAdd + 3600);

    setChoosenDate(date);
    handleShow();
  };
  const removeTimeSlot = (parent, child) => {
    setTableRow((prevTable) => {
      let newArray = [...prevTable];
      const index = newArray.findIndex((obj) => obj.id === choosenDate.id);

      if (index !== -1) {
        // Update the specific field in the found object
        newArray[index] = {
          ...newArray[index],
          timeSlots: newArray[index].timeSlots.filter((e) => e.id !== child),
        };
        // Set the state with the updated array
        return newArray;
      }
    });
  };

  const submitHandler = () => {
    if (!tableRow.length) return toast.error("No Dates selected");
    for (let i = 0; i < tableRow.length; i++) {
      if (tableRow[i].timeSlots.length === 0)
        return toast.error("Time slots missing");
    }
    setTableRow([]);
    setSelected(null);
    console.log(tableRow);
    return toast.success("Submitted successfully");
  };

  return (
    <div>
      <div>
        <span>Select Type : &nbsp; </span>
        <select onChange={selectHandler}>
          <option value="single">Single</option>
          <option value="multiple">Multiple</option>
          <option value="range">Range</option>
        </select>
      </div>
      <DayPicker
        className="mt-5 mx-auto"
        mode={typeSelect}
        onSelect={dateSelectHandler}
        selected={selected}
        disabled={disableHandler}
        numberOfMonths={3}
      />

      <button className="btn btn-primary" onClick={addDates}>
        Add Dates
      </button>
      <button
        className="btn btn-danger ms-3"
        onClick={() => {
          setSelected(null);
        }}
      >
        Reset
      </button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th className="header-row sr-header">Sr no.</th>
            <th className="header-row dates-header">Dates</th>
            <th className="header-row time-header"> Time Slots &nbsp; </th>
            <th className="header-row action-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableRow?.map((e, i) => (
            <tr key={e.id}>
              <td className="text-center">{i + 1}</td>
              <td className="text-center">
                {e?.date?.from
                  ? new Date(e?.date?.from).toDateString() +
                    " to " +
                    new Date(e?.date?.to).toDateString()
                  : new Date(e?.date).toDateString()}
              </td>
              <td className="d-flex">
                <i
                  style={{ color: "blue", cursor: "pointer" }}
                  className="ri-add-circle-line fs-5"
                  onClick={() => {
                    handleTimeSlotAdd(e);
                  }}
                ></i>
                <div className="ms-2 grid">
                  {e?.timeSlots.map((timeEl) => (
                    <Badge className="badge badge-primary mx-1" key={timeEl.id}>
                      {timeEl.from.label + " to " + timeEl.to.label} &nbsp;{" "}
                      <i
                        className="ri-close-line"
                        onClick={() => {
                          removeTimeSlot(e.id, timeEl.id);
                        }}
                      ></i>
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="text-center">
                <i
                  style={{ color: "red", cursor: "pointer" }}
                  className="ri-delete-bin-line fs-5"
                  onClick={() => {
                    setTableRow(tableRow.filter((ele) => ele.id !== e.id));
                  }}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex mt-5">
        <div className="mx-auto">
          <button className="btn btn-primary mx-4" onClick={submitHandler}>
            {" "}
            Submit
          </button>
          <button className="btn btn-danger" onClick={() => setTableRow([])}>
            {" "}
            Clear
          </button>
        </div>
      </div>
      {show ? <Popup /> : null}
    </div>
  );
}

export default CalendarView;
