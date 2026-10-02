export interface Response {
  _id: string;
  response: string;
  isTrue: boolean;
quiz:string ;//id reference au quiz
selected?: boolean; // Nouveau champ pour indiquer si la réponse est sélectionnée

}
