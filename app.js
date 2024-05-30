const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
let db = null
const dbpath = path.join(__dirname, 'covid19India.db')
app.use(express.json())

const initdbandserver = async () => {
  try {
    db = await open({filename: dbpath, driver: sqlite3.Database});
    app.listen(3000, () => {
      console.log('server running....');
    });
  } catch (e) {
    console.log(`error is ${e.message}`);
    process.exit(1);
  }
};

initdbandserver();

const getstatedetails = a => {
  return {
    stateId: a.state_id,
    stateName: a.state_name,
    population: a.population,
  }
}

app.get('/states/', async (request, response) => {
  const getQuery1 = `SELECT * FROM state`
  const getQuery1result = await db.all(getQuery1)
  response.send(getQuery1result.map(a => getstatedetails(a)))
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getQuery2 = `SELECT * FROM state WHERE state_id=${stateId}`
  const getQuery2result = await db.get(getQuery2)
  response.send(getstatedetails(getQuery2result))
})

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postQuery1 = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) VALUES ('${districtName}',
  ${stateId},${cases},${cured},${active},${deaths})`
  const postQuery1result = await db.run(postQuery1)
  response.send('District Successfully Added')
})


const getdistrictfun=a>{
  return{
    districtId: a.district_id,
    districtName: a.district_name,
    stateId: a.state_id,
    cases: a.cases,
    cured: a.cured,
    active: a.active,
    deaths: a.deaths
    }

}
app.get("/districts/:districtId/",async (request,response)=>{
  const {districtId}=request.params;
  const getdistrictQuery=`SELECT * FROM district WHERE district_id=${districtId}`;
  const getdistrictQueryresult=await db.all(getdistrictQuery);
  response.send(getdistrictfun(getdistrictQueryresult))
})

app.delete("/districts/:districtId/",async (request,response)=>{
  const {districtId}=request.params;
  const deleteQuery=`DELETE FROM district WHERE district_id=${districtId}`;
  const deleteQueryresult=await db.run(deleteQuery);
  respond.send("District Removed")
})

app.put("/districts/:districtId/", async (request,response)=>{
  const {districtId}=request.params;
  const {districtName,stateId,cases,cured,active,deaths}=request.body;
  const putQuery=`UPDATE district SET district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths}`
  const putresult=await db.run(putQuery);
  response.send("District Details Updated");
})

app.get("/states/:stateId/stats/",async (request,response)=>{
  const {stateId}=request.params;
  const api7Query=`SELECT SUM(cases) as totalCases,
  SUM(cured) as totalCured,
  SUM(active) as totalActive,
  SUM(deaths) as totalDeaths FROM district WHERE state_id=${stateId}`;
  const api7result=await db.get(api7Query);
  respond.send(api7result);
})

app.get("/districts/:districtId/details/",async (request, response) => {
    const { districtId } = request.params;
    const getDistrictIdQuery = `
    SELECT state_id FROM district
    WHERE district_id = ${districtId}`;
    const getDistrictIdQueryResponse =await db.get(getDistrictIdQuery);
    const getStateNameQuery = `
    SELECT state_name as stateName FROM state
    WHERE state_id = ${getDistrictIdQueryResponse.state_id}`;
    response.send(getStateNameQuery);
    })

module.exports=app