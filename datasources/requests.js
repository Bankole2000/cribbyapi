const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const { DataSource } = require("apollo-datasource");

class LocationRequestAPI extends DataSource {
  constructor(){
    super();
  }
  initialize(config){}
  async getStateAddRequests(searchText){
    let stateAddRequests
    if(searchText){
      stateAddRequests = await prisma.stateAddRequest.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            stateCode: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            countryCode: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            countryName: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }
        ]
      }
    })
    return stateAddRequests;
  }
    stateAddRequests = await prisma.stateAddRequest.findMany({})
    return stateAddRequests
  }

  async getCityAddRequests(searchText){
    const cityAddRequests = await prisma.cityAddRequest.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            stateCode: {
              contains: searchText, 
              mode: 'insensitive'
            }
          },
          {
            stateName: {
              contains: searchText, 
              mode: 'insensitive'
            }
          },
          {
            countryCode: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }, 
          {
            countryName: {
              contains: searchText, 
              mode: 'insensitive'
            }
          }
        ]
      }
    })
    return cityAddRequests;
  }

  async addOrUpdateStateAddRequest(data){
    let stateAddRequest;
    const {id} = data;
    delete data.id;
    if(id){
      stateAddRequest = await prisma.stateAddRequest.update({
        where: {
          id: Number(id)
        },
        data
      })
      return stateAddRequest;
    }
    stateAddRequest = await prisma.stateAddRequest.create({
      data
    })
    return stateAddRequest
  }

  async addOrUpdateCityAddRequest(data){
    let cityAddRequest;
    const {id} = data;
    delete data.id;
    if(id){
      cityAddRequest = await prisma.cityAddRequest.update({
        where: {
          id: Number(id)
        },
        data
      })
      return cityAddRequest;
    }
    cityAddRequest = await prisma.cityAddRequest.create({
      data
    })
    return cityAddRequest
  }

  async deleteStateAddRequest(id){
    const deletedStateAddRequest = await prisma.stateAddRequest.delete({
      where: {
        id: Number(id)
      }
    });
    return deletedStateAddRequest
  }

  async deleteCityAddRequest(id){
    const deletedCityAddRequest = await prisma.cityAddRequest.delete({
      where: {
        id: Number(id)
      }
    });
    return deletedCityAddRequest;
  }
}

module.exports = LocationRequestAPI;
