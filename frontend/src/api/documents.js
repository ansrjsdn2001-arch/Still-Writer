import { deleteJson, getJson, patchJson, postJson } from './client';

export async function createDocument(payload) {
  return postJson('/api/documents', payload);
}

export async function autoSaveDocument(payload) {
  return postJson('/api/documents/autosave', payload);
}

export async function getDocuments() {
  return getJson('/api/documents');
}

export async function getDocument(documentId) {
  return getJson(`/api/documents/${documentId}`);
}

export async function updateDocument(documentId, payload) {
  return patchJson(`/api/documents/${documentId}`, payload);
}

export async function deleteDocument(documentId) {
  return deleteJson(`/api/documents/${documentId}`);
}
