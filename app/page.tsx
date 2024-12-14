'use client'

import { useEffect, useRef, useState } from 'react';
import { Format, StringByteCodec } from './utils/stringByteCodec';

enum Action {
  Encode = "encode",
  Decode = "decode",
}


type State<T> = {
  input: T extends Action.Encode ? string : AllowSharedBufferSource
  output: string
  // output: string
  error: string
}

const options = {
  "utf-8 to Decimal": { action: Action.Encode, format: Format.Decimal, input: 'UTF-8', output: 'Decimal' },
  "utf-8 to Hexadecimal": { action: Action.Encode, format: Format.Hexadecimal, input: 'UTF-8', output: 'Hexadecimal' },
  "Decimal to utf-8": { action: Action.Decode, format: Format.Decimal, input: 'Decimal', output: 'UTF-8' },
  "Hexadecimal to utf-8": { action: Action.Decode,  format: Format.Hexadecimal, input: "Hexadecimal", output: 'UTF-8'},
}

type OptionKey = keyof typeof options;


function initialState(action: OptionKey): State<Action> {
  if (options[action].action == Action.Encode) {
    return { input: '', output: '', error: '' }
  } 
  return {input: new Uint8Array(), output: '', error: '' }
}


export default function Page() {

  const [action, setAction] = useState<OptionKey>("utf-8 to Decimal")

  const [state, setState] = useState<State<Action>>(initialState(action))

  const stringByetCodec = useRef<null | StringByteCodec>(null);


  useEffect(() => {
    stringByetCodec.current = new StringByteCodec()
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) { 
    const { name, value } = event.target;

    if (name === "actionType") {

      setAction(value as OptionKey)
      setState(initialState(value as OptionKey))
      return;
    }

    if (!stringByetCodec.current) return;

    if (options[action].action == Action.Encode) {
      const output = stringByetCodec.current?.encode(value as string, options[action].format).toString().split(",").join(" ");
      setState({input: value, output, error: ''})
      } else {
      try {
        setState({input: value, output: stringByetCodec.current?.decode(value as string, options[action].format), error: ''})
      } catch (error) {
        setState({input: value, output: '', error: (error as Error)?.message || "Invalid format"})
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-6 border-slate-100 w-full items-center">
      <div className="">
        <div className="mb-8">
          <select onChange={handleChange} name='actionType' className='w-64 mb-4' >
            {Object.keys(options).map((label) => (
              <option value={label} key={label}>{label}</option>
            ))}
          </select>
          
          <p className='text-sm text-red-500'>{state.error}</p>

        </div>

        <div className="flex gap-8">
          <div className="">
            <p>{options[action].input}</p>
            <textarea name='input' value={state.input.toString()} onChange={handleChange} rows={30} cols={50}  />
          </div>

          <div className="">
            <p>{options[action].output}</p>
            <textarea name='output' value={state.output.toString()} onChange={handleChange} rows={30} cols={50} disabled />
          </div>

        </div>

      </div>
    </main>
  );
}
