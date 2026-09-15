import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Buscar usuário pelo email (assumindo que o email é usado como ID do documento)
    // Na prática, você precisará buscar pelo auth UID
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado. Faça login primeiro.' }, { status: 404 })
    }

    const userDoc = snapshot.docs[0]
    const userId = userDoc.id

    // Atualizar usuário como admin
    await setDoc(doc(db, 'users', userId), {
      ...userDoc.data(),
      isAdmin: true
    }, { merge: true })

    return NextResponse.json({ success: true, message: 'Usuário configurado como admin com sucesso!' })
  } catch (error) {
    console.error('Erro ao configurar admin:', error)
    return NextResponse.json({ error: 'Erro ao configurar admin' }, { status: 500 })
  }
}
