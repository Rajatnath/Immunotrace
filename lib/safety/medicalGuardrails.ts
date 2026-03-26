const emergencyPattern =
  /(chest pain|difficulty breathing|blood in cough|fainting|severe dehydration|confusion|high fever > 103|seizure)/i;

export function containsEmergencySignal(input: string) {
  return emergencyPattern.test(input);
}

export function getSafetyDisclaimer() {
  return "This guidance is informational and not a diagnosis. Consult a licensed doctor for persistent or severe symptoms.";
}

export function sanitizeMedicalResponse(response: string) {
  // Remove direct dosage wording in conservative MVP mode.
  return response.replace(/\b\d+\s?(mg|ml)\b/gi, "[dosage removed]");
}
