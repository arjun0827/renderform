import { useState } from "react";
import { reference } from "../imports/firebase";
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, SubmitHandler } from "react-hook-form";
import InputField from "../InputField/InputField";
import { IoAttach } from "react-icons/io5";
import "./UserForm.css";

enum GenderEnum {
  male = "male",
  female = "female",
  angels = "angels",
}

interface IFormInputs {
  // data: any;
  names: string;
  email: string;
  file: string;
  number: string;
  company: string;
  linkedin: string;
  information: string;
  gender: GenderEnum;
}

const UserForm = () => {
  const [fileData, setFileData] = useState("");
  const [verified, setVerified] = useState(false);
  const [fileName, setFileName] = useState("");

  const onChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      if (e.currentTarget.files[0].size > 5000000) {
        setFileData("file size should  less than 5mb");
      } else {
        setFileName(e.currentTarget.files[0].name);
        return null;
      }
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
  } = useForm<IFormInputs>();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    console.log(data.file, "file");
    if (verified) {
      await uploadFile(data);
      await writeUserDataToStrapi(data);
      alert("file uploaded successfully");
      // window.location.reload();
    } else {
      alert("captcha verification failed");
    }
  };

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCJX2wheUZ8IqiMkMZzN4Em5AOkfpmMyxU",
    authDomain: "renderform-6bbf0.firebaseapp.com",
    databaseURL: "https://renderform-6bbf0-default-rtdb.firebaseio.com",
    projectId: "renderform-6bbf0",
    storageBucket: "renderform-6bbf0.appspot.com",
    messagingSenderId: "533648263438",
    appId: "1:533648263438:web:3b0423dd239a6e56892f5f",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const uploadFile = (data: any) => {
    const metadata = {
      contentType: "file/pdf",
    };
    const storageRef = reference(storage, "file/");
    const uploadTask = uploadBytesResumable(storageRef, data.file[0], metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        switch (error.code) {
          case "storage/unauthorized":
            console.log("User doesn't have permission to access the object");
            break;

          case "storage/canceled":
            console.log("User canceled the upload");
            break;

          case "storage/unknown":
            console.log("Unknown error occurred, inspect error.serverResponse");
            break;
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          data.file = downloadURL;
          writeUserData(data);
          console.log({ "firebase url": data });
        });
      }
    );
  };

  const writeUserData = (data: any) => {
    const db = getDatabase();
    set(ref(db, "users/"), {
      name: data.names,
      email: data.email,
      number: data.number,
      company: data.company,
      linkedin: data.linkedin,
      informatin: data.information,
      gender: data.gender,
      file: data.file,
    })
      .then(() => alert("Success"))
      .catch(() => alert("Something went wrong"));
  };

  const writeUserDataToStrapi = async (data: any) => {
    const postData = {
      name: data.names,
      email: data.email,
      number: data.number,
      company: data.company,
      linkedin: data.linkedin,
      informatin: data.information,
      gender: data.gender,
    };
    const file = data.file[0];

    const request = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("files.file", file, file.name);

    formData.append("data", JSON.stringify(postData));

    request.open("POST", `http://localhost:1337/api/collections`);

    request.send(formData);
  };

  return (
    <div className="user-form d-flex justify-content-center py-5">
      <div className="form">
        <h6 className="text-uppercase pb-5 ">submit your application</h6>
        <form onSubmit={handleSubmit(onSubmit)} method="POST">
          <InputField
            formState={formState}
            register={register}
            fieldName="names"
            label="Full Name"
          />
          <InputField
            formState={formState}
            register={register}
            fieldName="email"
            label="Email"
          />

          <div className="py-3 d-flex responsive-screen">
            <label
              htmlFor="formFile"
              className="form-label file-label asterik-sign"
            >
              Resume/CV
            </label>
            <div className="d-flex flex-column">
              <button
                disabled
                className="choose-btn text-uppercase btn px-2 py-2 w-75"
              >
                {fileName ? (
                  <span>{`${fileName.substring(0, 20)}...`}</span>
                ) : (
                  <span>
                    <IoAttach size={20} /> Attach Resume/cv
                  </span>
                )}
              </button>
              <input
                className=" w-100 file-input"
                {...register("file")}
                type="file"
                accept="application/pdf"
                id="formFile"
                onChange={(e) => onChangeHandler(e)}
              />
              {<p>{fileData}</p>}
            </div>
          </div>

          <InputField
            formState={formState}
            label="Phone"
            register={register}
            fieldName="number"
          />

          <InputField
            formState={formState}
            label="Current Company"
            register={register}
            fieldName="company"
          />

          <InputField
            formState={formState}
            label="Linkedin URL"
            register={register}
            fieldName="linkedin"
          />

          <div className="py-3 responsive-screen">
            <label
              htmlFor="floatingTextarea"
              className="text-uppercase fw-bold py-5"
            >
              additional information
            </label>
            <textarea
              className="form-control text-area-field"
              placeholder="Add a cover letter or anything else you want to share"
              id="floatingTextarea"
              rows={6}
              {...register("information", {
                minLength: { value: 30, message: "minimum characters are 30" },
              })}
            ></textarea>
            {errors.information && <p>{errors.information.message}</p>}
          </div>

          <div className="responsive-screen py-5 d-flex justify-content-center align-items-baseline">
            <label htmlFor="floatingSelect" className="py-3 w-50">
              Gender
            </label>
            <select
              className="form-select"
              id="floatingSelect"
              {...register("gender", { required: true })}
              aria-label="Floating label select example"
            >
              <option>Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="angels">Angels</option>
            </select>
          </div>
          <div className="recaptcha d-flex justify-content-center">
            <ReCAPTCHA
              sitekey="6Le-JEQfAAAAAD0r2SFM1s_5-bbnVoLjTLsGwKe2"
              onChange={() => setVerified(true)}
              onErrored={() => setVerified(false)}
            />
          </div>

          <div className="w-100 d-flex justify-content-center py-5">
            <button type="submit" className="btn btn-primary text-uppercase">
              Submit application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
