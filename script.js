const hospitais = [
  {
    nome: "Hospital Mãe de Deus",
    fila: 12,
    tempo_estimado: "1h58min",
    distancia: "11Km",
  },
  {
    nome: "Hospital Santa Casa",
    fila: 8,
    tempo_estimado: "1h30min",
    distancia: "15Km",
  },
  {
    nome: "Hospital Moinhos de Vento",
    fila: 5,
    tempo_estimado: "45min",
    distancia: "7Km",
  },
  {
    nome: "Hospital de Clínicas",
    fila: 20,
    tempo_estimado: "2h30min",
    distancia: "20Km",
  },
  {
    nome: "Hospital Conceição",
    fila: 15,
    tempo_estimado: "2h",
    distancia: "10Km",
  },
  {
    nome: "Hospital São Lucas",
    fila: 3,
    tempo_estimado: "30min",
    distancia: "5Km",
  },
  {
    nome: "Hospital Ernesto Dornelles",
    fila: 10,
    tempo_estimado: "1h15min",
    distancia: "12Km",
  },
  {
    nome: "Hospital Divina Providência",
    fila: 6,
    tempo_estimado: "1h",
    distancia: "9Km",
  },
  {
    nome: "Hospital Restinga e Extremo-Sul",
    fila: 0,
    tempo_estimado: "0min",
    distancia: "3Km",
  },
  {
    nome: "Hospital de Pronto Socorro de Porto Alegre",
    fila: 25,
    tempo_estimado: "3h",
    distancia: "25Km",
  },
];

const cardsContainer = document.getElementById("cardsContainer"); // Selecione o elemento onde os cards serão adicionados
let latitude, longitude; // Declaração global das variáveis
let ruaUser; // Declare a variável ruaUser fora do loop forEach

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude; // Atribuição global dos valores
          longitude = position.coords.longitude;
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
}

function getNearestStreet(latitude, longitude) {
  var url = `https://nominatim.openstreetmap.org/reverse.php?lat=${latitude}&lon=${longitude}&zoom=18&format=jsonv2`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.address) {
        var nearestStreet = data.address.road;
        let city = data.address.city;
        if (nearestStreet) {
          return { nearestStreet, city };
        } else {
          throw new Error("Street name not found.");
        }
      } else {
        throw new Error("No results found.");
      }
    });
}

function getCoordinatesByAddress(address) {
  var url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        return { latitude: data[0].lat, longitude: data[0].lon };
      } else {
        throw new Error("Address not found.");
      }
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Raio da Terra em quilômetros
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLon = ((lon2 - lon1) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;

  return distance; // Distância em quilômetros
}

function getDistanceBetween(address1, address2) {
  return Promise.all([
    getCoordinatesByAddress(address1),
    getCoordinatesByAddress(address2),
  ])
    .then(([coords1, coords2]) => {
      var distance = calculateDistance(
        coords1.latitude,
        coords1.longitude,
        coords2.latitude,
        coords2.longitude
      );
      console.log("Distance:", distance.toFixed(2), "km");
      return distance;
    })
    .catch((error) => console.error("Error:", error));
}

function renderCard(hospital) {
  cardsContainer.innerHTML += `
      <div class="card d-flex justify-content-center align-items-center my-3 mx-md-3 text-center" style="width: 18rem">
        <img src="https://placehold.co/300x300" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${hospital.nome}</h5>
          <p class="card-text">Pacientes na fila</p>
          <h1>${hospital.fila}</h1>
          <p class="card-text">Estimativa ${hospital.tempo_estimado}</p>
          <a href="#" class="btn btn-primary text-center">${hospital.distancia} km </a>
        </div>
      </div>
    `;
}

getLocation()
  .then(() => {
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    return getNearestStreet(latitude, longitude); // Retorna a rua mais próxima
  })
  .then((nearestStreet) => {
    ruaUser = `${nearestStreet.nearestStreet}, ${nearestStreet.city}`; // Atualiza ruaUser com a rua mais próxima

    // Atualiza a distância de cada hospital no array
    hospitais.forEach(async (hospital) => {
      try {
        const distance = await getDistanceBetween(
          ruaUser,
          hospital.nome + ", Porto Alegre"
        );
        hospital.distancia = distance.toFixed(2); // Atualiza a distância no objeto hospital
      } catch (error) {
        console.error(error);
      }
    });
  })
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });

function montarSite(hospitais) {
  hospitais.sort((a, b) => a.distancia - b.distancia);
  hospitais.forEach((hospital) => {
    renderCard(hospital); // Renderiza o card com a nova distância
  });
}
