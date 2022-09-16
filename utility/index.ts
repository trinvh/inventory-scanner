import _ from 'lodash'
import moment from 'moment'

export const normalizeDateRange = (dateRange: any) => {
  if (_.isArray(dateRange) && dateRange.length === 2) {
    dateRange[1] = moment(dateRange[1]).endOf('day').toISOString()
  }
  return dateRange
}