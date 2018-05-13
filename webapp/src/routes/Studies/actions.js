import { Config } from 'consts';
const _ = require('lodash');
const faker = require('faker');
const querystring = require('querystring');
export const REQUEST_STUDIES = 'REQUEST_STUDIES'
export const RECEIVE_STUDIES = 'RECEIVE_STUDIES'
export const SELECT_STUDY_LIST = 'SELECT_STUDY_LIST'
export const RECEIVE_TRADES = 'RECEIVE_TRADES'

function requestStudies() {
  return {
    type: REQUEST_STUDIES
  }
}
 
function receiveStudies(res, study_list_label) {
  return {
    type: RECEIVE_STUDIES,
    items : res["items"],
    total_count : res["total_count"],
    page_offset : res["page_offset"],
    study_list_label : study_list_label,
    received_at: Date.now()
  }
}
function receiveTrades(trades) {
  return {
    type: RECEIVE_TRADES,
    trades : trades,
    received_at: Date.now()
  }
}
 
export function selectStudyList(selected_study_list) {
  return {
    type: SELECT_STUDY_LIST,
    selected_study_list : selected_study_list
  }
}

export function SubscribeTrades() {
	return (dispatch, getState) => {
		console.log("SubscribeTrades")
		var url = Config.api_base_url + "SubscribeTrades";
		return fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
		.then((response) => response.json())
		.then((res_json) => {
			dispatch(receiveTrades(res_json))
			console.log(res_json)
			// _.forOwn(res_json, function(v,k){
			// 	console.log(k, v)
			// 	// console.log(JSON.parse(v))
			// })

		})
		.catch(function(error) {
			console.error(error)
		})
	}
}
 
export function fetchStudies(query) {
  return (dispatch, getState) => {
    dispatch(requestStudies());
		var q = Object.assign({}, query)
		const state = getState();
		const {studies} = state;
		const {selected_study_list, study_lists} = studies;
		var study_statuses = ["all", "pending-review", "reviewed", "pending-arbitration"]

		var user = {
			"user_id" : "user_id"
		}

		if (!q["page_size"]) {
			q["page_size"] = 25
		}


		if (q["status"]) {
			study_statuses = [q["status"]]
		}


		_.forEach(study_statuses, function(s, i){
			q["status"] = s
			if (!query || !query["page_offset"]) {
				const current_study_list = study_lists[s]
				q["page_offset"] = current_study_list ? current_study_list.page_offset : 0;
			}
			const query_params = querystring.stringify(q);

			var url = Config.api_base_url + 'case/' + user.user_id + "?" + query_params;
			return fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then((response) => response.json())
			.then((res_json) => {
				const items = res_json["items"]
				res_json["items"] = _.map(items, function(item, idx){
					item['id'] = faker.random.uuid();
					const {rad_report} = item;
					if (item.dicom_tags) {
						const elem = item.dicom_tags
						item['name'] = _.startCase(_.toLower(elem.PatientName.replace("^", "	")));
						item['study_description'] = elem.StudyDescription? elem.StudyDescription : "-";
						item['modality'] = elem.Modality;
						item['patient_ID'] = elem.PatientID;
						item['acquisition_date'] = elem.AcquisitionDate;
						item['accession_number'] = elem.AccessionNumber;
						item['original_name'] = item.originalname.split("/")[-1];
					} else if(item.dicom_elements) {
						const elem = item.dicom_elements
						item['name'] = _.startCase(_.toLower(elem.PatientName.value.replace("^", "	")));
						item['study_description'] = elem.StudyDescription? elem.StudyDescription.value : "-";
						item['acquisition_date'] = elem.AcquisitionDate? elem.AcquisitionDate.value : "-";
						item['modality'] = elem.Modality.value;
						item['patient_ID'] = elem.PatientID.value;
						item['accession_number'] = elem.AccessionNumber.value;
						item['patient_birth_date'] = elem.PatientBirthDate.value;
						const orig_name_path = item.original_name.split("/")
						item['original_name'] = orig_name_path[orig_name_path.length - 1];
					}
					return item;
				});
				dispatch(receiveStudies(res_json, s))
			})
			.catch(function(error) {
				console.error(error)
			})
		})
  }
}
