import logo from "./logo.svg";
import "./App.css";
import Main from "./MainContainer";
import LPR from "./LPR";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";

function App() {  
  const [verified, setVerified] = useState();
  const [input, setInput] = useState();
  const [switchz, setSwitch] = useState(false);
  // "https://https://versa-snapper-staging-svc.azurewebsites.net/verify_internal_acess",

  const switches = () => {
    setSwitch(!switchz)
  }
  
  let loc_arr = window.location.href.split('/');
  let current_loc = loc_arr[loc_arr.length -1];
  return (
    <div>
      { switchz ?
        <LPR switches={(() => switches())} />
        :
        <Main switches={(() => switches())} />
      }
    </div>
  );
}

export default App;
