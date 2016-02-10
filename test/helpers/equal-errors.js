import { deepEqual } from 'assert'

export const equalErrors = (error1, error2) => {
  deepEqual(error1.name, error2.name)
  deepEqual(error1.message, error2.message)
}

export default equalErrors
