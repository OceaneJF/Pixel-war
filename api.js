
/**
 * Cette fonction permet d'attribuer une équipe au joeur
 * @param {string} UID l'uid du joueur
 * @param {number} equipeChoisi l'équipe choisie par le joueur
 * @returns la reponse de l'api
 */
export const associerEquipe = (UID, equipeChoisi) => {
  return fetch(`https://pixel-api.codenestedu.fr/choisir-equipe`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: UID,
      nouvelleEquipe: equipeChoisi,
    }),
  })
}


/**
 * Cette fonction permet de modier une case du tableau de pixel
 * @param {string} couleurChoisie la couleur choisie par le joueur
 * @param {string} UID l'iud du joueur
 * @param {number} colonneSelectionne la colonne du tableau sélectionné 
 * @param {number} ligneSelectionne la ligne du tableau sélectionné 
 * @returns la réponse de l'api
 */
export const modifierCase = (couleurChoisie, UID, colonneSelectionne, ligneSelectionne) => {
  return fetch(`https://pixel-api.codenestedu.fr/modifier-case`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      color: couleurChoisie,
      uid: UID,
      col: colonneSelectionne,
      row: ligneSelectionne,
    }),
  })
}

/**
 * Cette fonction permet de récuperer le tableau de pixel
 * @returns la réponse de l'api
 */
export const recupererTableau = () => {
  return fetch("https://pixel-api.codenestedu.fr/tableau");
}

/**
 * Cette fonction permet de récuperer la liste des joueurs
 * @param {string} UID l'uid du joueur
 * @returns la réponse de l'api
 */
export const recupererListeJoueur = (UID) => {
  return fetch(`https://pixel-api.codenestedu.fr/liste-joueurs?uid=${UID}`);
}

/**
 * Cette fonction permet de récuperer le temps d'attente avant de pouvoir poser un autre pixel
 * @param {string} UID l'uid du joueur
 * @returns la réponse de l'api
 */
export function recupererTempsAttente(UID) {
  return fetch(`https://pixel-api.codenestedu.fr/temps-attente?uid=${UID}`);
}