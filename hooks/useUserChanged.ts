import { useEffect } from 'react'
import { useRouter } from 'next/router'
import firebase from '../firebaseConfig'
import Cookie from 'universal-cookie'

export let unSubMeta: () => void

export const useUserChanged = () => {
  const cookie = new Cookie()
  const router = useRouter()
  const HASURA_TOKEN_KEY = 'https://hasura.io/jwt/claims'

  useEffect(() => {
    const unSubUser = firebase.auth().onAuthStateChanged(async (user) => {
      // [memo] firebaseのuserが変わるたびに実行される処理( = onAuthStateChanged)
      if (user) {
        const token = await user.getIdToken(true)
        const idTokenResult = await user.getIdTokenResult()
        const hasuraClaims = idTokenResult.claims[HASURA_TOKEN_KEY]
        if (hasuraClaims) {
          cookie.set('token', token, { path: '/' })
          router.push('/tasks')
        } else {
          const userRef = firebase
            .firestore()
            .collection('user_meta')
            .doc(user.uid)
          unSubMeta = userRef.onSnapshot(async () => {
            // [memo] onSnapshotでuser_metaに書き込みがあったことを検知する(書き込みまでのラグがあるのでこのような処理を入れている)
            const tokenSnap = await user.getIdToken(true)
            const idTokenResultSnap = await user.getIdTokenResult()
            const hasuraClaimsSnap = idTokenResultSnap.claims[HASURA_TOKEN_KEY]
            if (hasuraClaimsSnap) {
              cookie.set('token', tokenSnap, { path: '/' })
              router.push('/tasks')
            }
          })
        }
      }
    })
    return () => {
      unSubUser()
    }
  }, [])

  return {}
}
