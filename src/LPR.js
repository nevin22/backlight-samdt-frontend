import "./App.css";
import axios from "axios";
import { useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = event => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setSelectedFile(event.target.files[0]);
    }
  };

  const onFileUpload = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("myfile",
      selectedFile
    );
    axios({
      method: 'post',
      url: "https://viana-listener-mqtt-dev-svc.azurewebsites.net", // https://viana-listener-mqtt-dev-svc.azurewebsites.net
      data: formData,
      headers: {
        'Content-Type': `multipart/form-data;`,
      },
    }).then(d => {
      setLoading(false);
      setResults(d.data.response.results);
    }).catch(err => {
      setLoading(false);
      console.log('err', err)
    })
  }

  return (
    <div style={{ margin: 20 }}>
      <input type="file" name="myfile" onChange={onFileChange} style={{ fontFamily: 'Nunito', fontWeight: 'bold' }} />
      <button onClick={onFileUpload} style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>
        Upload!
      </button>
      <p style= {{ margin: 1, opacity: 0.4 }}>{`[NOTE] This will give a result even if u send a non-car object. You can validate it using the result's orientation if null or not.`}</p>
      {image &&
        <div style={{  marginTop: '20px', marginBottom: '20px' }}>
          <img src={image} alt="preview image" />
        </div>
      }
      {loading && <CircularProgress/>}
      {!loading && results && results.map((d, index) => {
        let vehicle = d.vehicle;
        let plate = d.plate;
        let last_item = results.length === index + 1;
        return (
          <div key={index}>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>PLATE: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{plate ? plate.props.plate[0].value : 'null'}</span> </p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>TYPE: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.type}</span> </p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>COLOR: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.props.color[0].value}</span> </p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>MAKE: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.props.make_model[0].make}</span> </p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>MODEL: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.props.make_model[0].model}</span></p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>ORIENTATION: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.props.orientation[0].value}</span></p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>CONFIDENCE: <span style={{ fontFamily: 'Nunito', fontWeight: 'normal' }}>{vehicle.score}</span></p>
            {!last_item && <p style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>---------------------</p>}
          </div>
        )
      })
      }
    </div>
  );
}

export default App;
