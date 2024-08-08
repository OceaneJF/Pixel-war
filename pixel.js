//Import des différentes fonctions
import { associerEquipe, modifierCase, recupererListeJoueur, recupererTableau, recupererTempsAttente } from "./api.js";


//Mettre l'uid dans le localStorage
const input = document.getElementById("UID");
let UID = window.localStorage.getItem("uid");
input.value = UID;

// Récupération de la modal
const modal = document.getElementById("myModal");
// Récupération de la croix pour fermer la modal
const fermerPopUp = document.getElementsByClassName("close")[0];

//Recupération de la couleur choisit dans le colorPicker
const colorPicker = document.getElementById("colorPicker");
let couleurChoisie = colorPicker.value;

//Récupération de tous les boutons pour le choix de l'équipe 
const equipes = document.querySelector(".boutonsEquipe");
//Variable pour récupérer l'équipe choisit
let equipeChoisi;

//Récupération de la balise p pour ecrire les messages du serveur
const infoServeur = document.querySelector(".infoServeur p");
//Récupération de la balise p pour ecrire les messages sur le temps d'attentes
const infoAttente = document.querySelector(".attente p");

//Récupération de la balise tbody du tableau
const tbody = document.querySelector("tbody");

//Récupération de la bar de progression 
const progress = document.querySelector('.progress-done');

//Récupération du canvas
const canvas = document.getElementById("canvas");
//Récupération du context du canvas
const ctx = canvas.getContext("2d");
//Taille d'un pixel sur le canvas
const taillePixel = 6;
//Nombre de pixels par lignes
const nbPixelsLigne = 100;
//Nombre de pixels par colonnes
const nbPixelsCol = 100;
//Le tableau de pixel renvoyé par l'api
let tableauDePixel;
//On donne une largeur et une hauteur au canvas
canvas.width = nbPixelsCol * taillePixel;
canvas.height = nbPixelsLigne * taillePixel;

//Permet de savoir si on peut poser un pixel ou non 
let peutPoser = true;


/**
 * Récupération de l'uid lors de la saisit
 */
input.addEventListener("input", () => {
  UID = input.value;
  //On met l'uid dans le local storage
  window.localStorage.setItem("uid", UID);
});

/**
 * Récupération de la couleur sélectionné avec le colorPicker
 */
colorPicker.addEventListener("input", () => {
  couleurChoisie = colorPicker.value;
});

//Fermeture de la modal lorsqu'on clique sur la croix 
fermerPopUp.onclick = () => {
  modal.style.display = "none";
}

//Fermeture de la modal lorsqu'on clique en dehors 
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

/**
 * Choix de l'équipe 
 */
for (let equipe of equipes.children) {
  equipe.addEventListener("click", (event) => {
    //Bouton sur lequel on a clicker
    equipeChoisi = event.target.id;
    //On associe l'équipe au joueur 
    associerEquipe(UID, equipeChoisi)
      .then(response => {
        //Si il n'y a pas d'erreur alors on sélectionne le bouton en changeant sa couleur de fond
        if (response.ok) {
          retirerFondBtn(equipes);
          equipe.style.backgroundColor = "green";
        }
        return response.json()
      })
      .then((body) => {
        infoServeur.textContent = body.msg;
        //Si il est possible de modifier le tableau alors on affiche le message ci dessous
        if (peutPoser) {
          infoAttente.textContent = "Vous pouvez modifier un pixel";
        }
      });
  });
}

/**
 * Cette fonction permet de "déselectionner" tous les boutons 
 * @param {Element} equipes 
 */
const retirerFondBtn = (equipes) => {
  for (let equipe of equipes.children) {
    equipe.style.backgroundColor = "";
  }
}

/**
 * Cette fonction permet d'initialiser le canvas
 * @returns le tableau de pixel renvoyé par l'api
 */
const initaliseCanvas = async () => {
  let reponse = await recupererTableau();
  tableauDePixel = await reponse.json();
  dessineCanvas(tableauDePixel, nbPixelsLigne, nbPixelsCol, ctx, taillePixel);
  return tableauDePixel;
}

/**
 * Cette fonction permet de dessiner le tableau de pixel renvoyé par l'api
 * @param {*array<array<string>>} tableauDePixel le tableau de pixel renvoyé par l'api
 * @param {number} nbPixelsLigne le nombre de pixels par lignes
 * @param {number} nbPixelsCol le nombre de pixels par colonnes
 * @param {*} ctx le contexte du canvas
 * @param {number} taillePixel la taille d'un pixel
 */
const dessineCanvas = (tableauDePixel, nbPixelsLigne, nbPixelsCol, ctx, taillePixel) => {
  for (let ligne = 0; ligne < nbPixelsLigne; ligne++) {
    for (let colonne = 0; colonne < nbPixelsCol; colonne++) {
      const couleur = tableauDePixel[ligne][colonne];
      ctx.fillStyle = couleur;
      ctx.fillRect(
        colonne * taillePixel,
        ligne * taillePixel,
        taillePixel,
        taillePixel
      );
    }
  }
}

//On initialise le canvas
initaliseCanvas();

/**
 * Permet de poser un pixel au click sur le canvas 
 */
canvas.addEventListener("click", (event) => {
  //Position de la souris au click
  const X = event.offsetX;
  const Y = event.offsetY;
  //Lignes et colonnes selectionnées
  const ligneSelectionne = Math.floor(Y / taillePixel);
  const colonneSelectionne = Math.floor(X / taillePixel);
  //Si on a bien saisit l'uid et son équipe alors on peut modifier une case 
  if (UID && equipeChoisi) {
    modifierCase(couleurChoisie, UID, colonneSelectionne, ligneSelectionne).then(response => {
      //si il y a une erreure on ne peut pas poser
      if (!response.ok) {
        peutPoser = false;
      } else {
        peutPoser = true;
      }
      return response.json()
    })
      .then((body) => {
        //Affichage du tableau d'informations 
        recupererListeJoueur(UID)
          .then((response) => response.json())
          .then((body) => {
            console.log(body);
            if (body.equipe == 0) {
              peutPoser = false;
            }
            creerLigneTab(body);
          });

        //Dans le cas ou il est possible de poser un pixel alors on change la couleur de la case avec la couleur choisit puis on réaffiche le canvas
        if (peutPoser && tableauDePixel != null) {
          console.log(peutPoser);
          //Création du countDown
          let compteur = 0;
          const timer = setInterval(() => {
            recupererTempsAttente(UID)
              .then((response) => response.json())
              .then((body) => {
                compteur++;
                peutPoser = false;
                //Affichage de la progress bar 
                progress.style.width = Math.floor((compteur / 15) * 100) + '%';
                progress.textContent = Math.floor((compteur / 15) * 100) + '%';
                //Affichage du temps d'attente en seconde
                infoAttente.textContent = Math.floor(body.tempsAttente / 1000) + " seconde(s)";
                console.log(body);
                //On peut poser un pixel uniquement si le temps est écoulé 
                if (body.tempsAttente == 0) {
                  peutPoser = true;
                  infoAttente.textContent = "Vous pouvez poser un pixel";
                  //On arrete le timer
                  clearInterval(timer);
                }
              }).catch(error => {
                alert(error.message);
              });
          }, 1000)
          //Affichage du tableau de pixel 
          tableauDePixel[ligneSelectionne][colonneSelectionne] = couleurChoisie;
          dessineCanvas(tableauDePixel, nbPixelsLigne, nbPixelsCol, ctx, taillePixel);
        }
        infoServeur.textContent = body.msg;
      });


    //Si on a saisit l'uid mais qu'on a pas choisit d'équipe alors on affiche un message d'erreur dans le paragraphe d'information du serveur 
  } else if (UID && !equipeChoisi) {
    infoServeur.textContent = "Error: vous devez etre associé à une équipe pour pouvoir jouer";
    //Sinon on affiche une popup d'erreur
  } else {
    modal.style.display = "block";
  }
});

//On met à jour le canvas toutes les 10000ms
setInterval(() => {
  tableauDePixel = initaliseCanvas();
  //Affichage du tableau d'informations 
  if (UID) {
    recupererListeJoueur(UID)
      .then((response) => response.json())
      .then((body) => {
        creerLigneTab(body);
      })
  }
}, 10000);


const creerLigneTab = (body) => {
  //Au depart on s'assure qu'il n'y a pas d'éléments dans le tableau
  tbody.innerHTML = "";
  //Pour chaque élément de la reponse de l'api on créer une balise td et on y met les valeurs récupéré dans l'api
  for (let i = 0; i < body.length; i++) {
    //création des éléments html pour l'ajout d'une nouvelle ligne au tableau
    const tr = document.createElement("tr");
    const nom = document.createElement("td");
    const equipe = document.createElement("td");
    const derniereModif = document.createElement("td");
    const banni = document.createElement("td");
    //On remplit les cases du tableau par les informations renvoyées par l'api
    nom.textContent = body[i].nom;
    equipe.textContent = body[i].equipe;
    derniereModif.textContent = body[i].lastModificationPixel;
    banni.textContent = body[i].banned;
    //On relie les balises td à la balise parent tr
    tr.appendChild(nom);
    tr.appendChild(equipe);
    tr.appendChild(derniereModif);
    tr.appendChild(banni);
    //On relie la balise tr à la balise parent tbody
    tbody.appendChild(tr);
  }
}
