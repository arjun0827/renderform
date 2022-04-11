import { FormState, UseFormRegister } from 'react-hook-form'
import './InputField.css'

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

interface IFormFields {
    formState?: FormState<IFormInputs>
    register: UseFormRegister<IFormInputs>
    fieldName: "number" | "names" | "email" | "file" | "company" | "linkedin" | "information" | "gender"
    label: string
  }
  
  const InputField = (props: IFormFields) => {

    const getValidation = (fieldName:string) =>{
      var obj: {[key : string] : any} = {};

      switch(fieldName){
        case 'names':
          obj.required = {value : true, message:'field required'};
          obj.minLength = {value : 10, message:'min length violation'};
          return obj;

          case 'email':
            obj.pattern = {value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'invalid email'};
            obj.required = {value: true, message: 'field required'};
            return obj;

            case 'number':
              obj.pattern = {value: /(\+[\d]{1,5}|0)[7-9]\d{9}$/, message: "invalid phone number"};
              obj.minLength = {value: 13, message: "country code also required"};
              obj.required = {value: true, message: 'This field is required'};
              return obj;

              case 'linkedin':
                obj.pattern = {value: /((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^/]+\/(([\w|\d-&#?=])+\/?){1,}))$/,
              message: "invalid linkedin profile"
              };
              obj.required = {value: true, message: "This field is required"};
              return obj;

          default: return obj;
      }
    }

    const isRequired=(fieldName:string):boolean=>{
        return fieldName==='names'|| fieldName==='file'|| fieldName==='email'
    }

    const fieldName = props.fieldName
    return (
      <div className="mb-3 d-flex responsive-screen">
              <label htmlFor="exampleInput " className={`${isRequired(props.fieldName)?'asterik-sign':null} form-label w-50`}>
                {props.label}
              </label>
              <div className="d-flex flex-column w-100">
                <input
                  type="text"
                  {...props.register(fieldName, 
                    getValidation(fieldName)
                  )}
                  className="form-control"
                  id="exampleInput"
                />
                {props.formState?.errors?[`${fieldName}`] && <p className='text-danger'>{props.formState.errors[`${fieldName}`]?.message}</p>:null}
              </div>
            </div>
    )
  }

export default InputField