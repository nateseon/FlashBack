import type { MusicDrop } from '../types/music';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * 드롭 생성 (POST /drops)
 * @param drop - 생성할 드롭 데이터 (id, createdAt 제외)
 * @returns 생성된 드롭 데이터
 */
export const createDrop = async (drop: Omit<MusicDrop, 'id' | 'createdAt'>): Promise<MusicDrop> => {
  // TODO: 백엔드 API 연동 시 실제 호출
  // const response = await fetch(`${API_BASE_URL}/drops`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(drop),
  // });
  // if (!response.ok) throw new Error('Failed to create drop');
  // return response.json();

  // 임시: 로컬에서 ID 생성하여 반환
  return {
    ...drop,
    id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
};

/**
 * 위치 기반 드롭 조회 (GET /drops?lat=...&lng=...&radius=...)
 * @param lat - 위도
 * @param lng - 경도
 * @param radius - 반경 (미터, 기본값: 1000)
 * @returns 드롭 배열
 */
export const getDropsByLocation = async (
  lat: number,
  lng: number,
  radius: number = 1000
): Promise<MusicDrop[]> => {
  // TODO: 백엔드 API 연동 시 실제 호출
  // const response = await fetch(
  //   `${API_BASE_URL}/drops?lat=${lat}&lng=${lng}&radius=${radius}`
  // );
  // if (!response.ok) throw new Error('Failed to fetch drops');
  // const data = await response.json();
  // return data.drops;

  // 임시: 빈 배열 반환
  return [];
};

/**
 * 드롭 상세 조회 (GET /drops/:id)
 * @param id - 드롭 ID
 * @returns 드롭 데이터
 */
export const getDropById = async (id: string): Promise<MusicDrop | null> => {
  // TODO: 백엔드 API 연동 시 실제 호출
  // const response = await fetch(`${API_BASE_URL}/drops/${id}`);
  // if (!response.ok) {
  //   if (response.status === 404) return null;
  //   throw new Error('Failed to fetch drop');
  // }
  // return response.json();

  // 임시: null 반환
  return null;
};

