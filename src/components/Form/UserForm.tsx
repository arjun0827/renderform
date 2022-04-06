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
import "./user_form.css";

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

  const onChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.files);
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      if (e.currentTarget.files[0].size > 50000) {
        setFileData("file size should  less than 5mb");
      } else {
        return;
      }
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();
  console.log(errors);
  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    console.log(data);
    uploadFile(data);
    writeUserDataToStrapi(data);
    uploadFileToStrapi(data);
  };

  const onChanges = (value: any) => {
    console.log("Captcha value:", value);
  };

  // Import the functions you need from the SDKs you need

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

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
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            console.log("User doesn't have permission to access the object");
            break;
          case "storage/canceled":
            // User canceled the upload
            console.log("User canceled the upload");
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            console.log("Unknown error occurred, inspect error.serverResponse");
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          data.file = downloadURL;
          writeUserData(data);
          console.log(data);
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

  const uploadFileToStrapi = async (data: any) => {
    let d = new FormData();
    console.log(data.file[0]);
    d.append("files", data.file[0]);
    console.log("FORM DAATA");
    console.log(d);
    await fetch("http://localhost:1337/api/upload/", {
      method: "POST",
      body: d,
    });
  };
  const writeUserDataToStrapi = async (data: any) => {
    await fetch("http://localhost:1337/api/collections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: data.names,
          email: data.email,
          number: data.number,
          company: data.company,
          linkedin: data.linkedin,
          informatin: data.information,
          gender: data.gender,
          file: data.file,
        },
      }),
    });
  };

  console.log({  errors })

  return (
    <div className="user-form d-flex justify-content-center py-5">
      <div className="form">
        <h6 className="text-uppercase pb-5">submit your application</h6>
        <form onSubmit={handleSubmit(onSubmit)} method="POST">
          <div className="mb-3 d-flex">
            <label htmlFor="exampleInputName" className="form-label w-50">
              Full name
            </label>
            <div className="d-flex flex-column w-100">
              <input
                type="text"
                {...register("names", {
                  required: "This field is required",
                  minLength: {
                    value: 10,
                    message: "minimum length 10 is required",
                  },
                })}
                className="form-control "
                id="exampleInputName"
              />
              {errors.names && <p>{errors.names.message}</p>}
            </div>
          </div>
          <div className="py-3 d-flex">
            <label htmlFor="exampleInputEmail1" className="form-label w-50">
              Email address
            </label>
            <div className="d-flex flex-column w-100">
              <input
                placeholder="Email"
                type="email"
                {...register("email",{pattern: {value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,message:'Invalid email'},minLength:{value: 15, message:"min length is 15"} , required:{value: true, message: 'field required'}})}
                className="form-control "
                id="exampleInputEmail1"
              />
              {errors.email && 
                <p className="text-primary">{errors.email.message}</p>
              }
            </div>
          </div>

          <div className="py-3 d-flex">
            <label htmlFor="formFile" className="form-label file-label">
              Resume/CV
            </label>
            <div className="d-flex flex-column">
              <input
                className="form-control w-100"
                {...register("file")}
                type="file"
                accept="application/pdf"
                id="formFile"
                onChange={(e) => onChangeHandler(e)}
              />
              {<p>{fileData}</p>}
            </div>
          </div>
          <div className="py-3 d-flex">
            <label htmlFor="quantity" className="form-label w-50">
              Phone
            </label>
            <div className="d-flex flex-column w-100">
              <input
                type="text"
                id="quantity"
                {...register("number", {
                  pattern: {
                    value: /(\+[\d]{1,5}|0)[7-9]\d{9}$/,
                    message: "invalid phone number ",
                  },
                  minLength: {
                    value: 13,
                    message: "country code also required",
                  },
                  required: { value: true, message: "This field is required" },
                })}
                className="form-control"
              />
              {errors.number && <p>{errors.number.message}</p>}
            </div>
          </div>
          <div className="py-3 d-flex">
            <label htmlFor="exampleInputCompany" className="form-label w-50">
              Current Company
            </label>
            <input
              type="text"
              className="form-control "
              {...register("company")}
              id="exampleInputCompany"
            />
          </div>

          <div className="py-3 d-flex">
            <label htmlFor="exampleInputLinkedin" className="form-label w-50">
              Linkedin URL
            </label>
            <div className="d-flex flex-column w-100">
              <input
                type="text"
                className="form-control "
                {...register("linkedin", {
                  pattern: {
                    value:
                      /((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^/]+\/(([\w|\d-&#?=])+\/?){1,}))$/,
                    message: "invalid linkedin profile",
                  },
                  required: { value: true, message: "This field is required" },
                })}
                id="exampleInputLinkedin"
              />
              {errors.linkedin && <p>{errors.linkedin.message}</p>}
            </div>
          </div>

          <div className="py-3">
            <label
              htmlFor="floatingTextarea"
              className="text-uppercase fw-bold py-5"
            >
              additional information
            </label>
            <textarea
              className="form-control"
              placeholder="Add a cover letter or anything else you want to share"
              id="floatingTextarea"
              rows={6}
              {...register("information", {
                minLength: { value: 30, message: "minimum characters are 30" },
              })}
            ></textarea>
            {errors.information && <p>{errors.information.message}</p>}
          </div>

          <div className="py-5 d-flex">
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
          <div className=" ps-4 w-100 d-flex justify-content-center">
            <ReCAPTCHA
              sitekey="6Le-JEQfAAAAAD0r2SFM1s_5-bbnVoLjTLsGwKe2"
              onChange={onChanges}
            />
          </div>

          <div className="w-100 d-flex justify-content-center py-5">
            <button
              type="submit"
              className="btn btn-primary text-uppercase"
              onClick={() => {
                console.log("ERRORS");
                console.log(errors);
              }}
            >
              Submit application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
