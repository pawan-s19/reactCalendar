import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimePicker from "react-bootstrap-time-picker";
import toast from "react-hot-toast";
import Badge from "react-bootstrap/Badge";
import { format } from "date-fns";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { v4 as uuidv4 } from "uuid";

function CalendarView() {
  const [selected, setSelected] = useState(null);
  const [typeSelect, setTypeSelect] = useState("single");
  const [fromTime, setFromTime] = useState(32400);
  const [toTime, setToTime] = useState(fromTime + 3600);
  const [timeSlots, setTimeSlots] = useState([]);
  const [tableRow, setTableRow] = useState([]);
  const [show, setShow] = useState(false);
  const [dataHolder, setDataHolder] = useState([]);
  const [choosenDateId, setChoosenDateId] = useState(null);

  const handleClose = () => setShow(false);
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
                  start="9:00"
                  end="22:00"
                  step={60}
                  onChange={(time) => setFromTime(time)}
                  value={fromTime}
                />
              </div>
              <div className="time-picker">
                <p>Ends</p>
                <TimePicker
                  start={`${Math.floor(Number(3600 + fromTime) / 3600)}:00`}
                  end="22:00"
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
          <Modal.Footer></Modal.Footer>
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
    let arrData = [
      ...timeSlots,
      {
        from: format(
          new Date().setHours(Math.floor(fromTime / 3600), 0, 0),
          "h:mm a"
        ),
        to: format(
          new Date().setHours(Math.floor(toTime / 3600), 0, 0),
          "h:mm a"
        ),
      },
    ];
    let newArray = tableRow;
    const index = newArray.findIndex((obj) => obj.id === choosenDateId);

    if (index !== -1) {
      // Update the specific field in the found object
      newArray[index] = {
        ...newArray[index],
        timeSlots: [
          ...newArray[index].timeSlots,
          {
            from: format(
              new Date().setHours(Math.floor(fromTime / 3600), 0, 0),
              "h:mm a"
            ),
            to: format(
              new Date().setHours(Math.floor(toTime / 3600), 0, 0),
              "h:mm a"
            ),
            id: uuidv4(),
          },
        ],
      };
      setTimeSlots(arrData);
      // Set the state with the updated array
      setTableRow(newArray);
    }
    handleClose();
  };
  const addDates = () => {
    let arr = [];
    for (let i = 0; i < dataHolder.length; i++) {
      arr.push({ date: dataHolder[i], id: uuidv4(), timeSlots: [] });
    }
    setTableRow([...tableRow, ...arr]);
  };
  const handleTimeSlotAdd = (id) => {
    handleShow();
    setChoosenDateId(id);
  };
  const removeTimeSlot = (parent, child) => {
    setTableRow((prevTable) => {
      let newArray = [...prevTable];
      const index = newArray.findIndex((obj) => obj.id === choosenDateId);

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
            <th style={{ width: "80px" }}>Sr no.</th>
            <th>Dates</th>
            <th> Time Slots &nbsp; </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableRow?.map((e, i) => (
            <tr>
              <td>{i + 1}</td>
              <td>
                {e?.date?.from
                  ? new Date(e?.date?.from).toDateString() +
                    " to " +
                    new Date(e?.date?.to).toDateString()
                  : new Date(e?.date).toDateString()}
              </td>
              <td>
                <i
                  style={{ color: "blue", cursor: "pointer" }}
                  className="ri-add-circle-line fs-5"
                  onClick={() => {
                    handleTimeSlotAdd(e.id);
                  }}
                ></i>
                {e?.timeSlots.map((timeEl) => (
                  <Badge className="badge badge-primary mx-3">
                    {timeEl.from + " to " + timeEl.to} &nbsp;{" "}
                    <i
                      class="ri-close-line"
                      onClick={() => {
                        removeTimeSlot(e.id, timeEl.id);
                      }}
                    ></i>
                  </Badge>
                ))}
              </td>
              <td>
                <i
                  style={{ color: "red", cursor: "pointer" }}
                  class="ri-delete-bin-line fs-5"
                  onClick={() => {
                    setTableRow(tableRow.filter((ele) => ele.id !== e.id));
                  }}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {show ? <Popup /> : null}
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
    </div>
  );
}

export default CalendarView;
