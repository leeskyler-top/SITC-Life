import {createRouter, createWebHashHistory} from 'vue-router'

const admin = {
    auth: true,
    is_admin: 'true',
}

const user = {
    auth: true,
}


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import("@/Home.vue"),
            meta: null
        },
        {
            path: '/user/detail',
            component: () => import("@/views/User/MyDetail.vue"),
            meta: {...user}
        },
        {
            path: '/user/manager',
            component: () => import("@/views/User/UserManager.vue"),
            meta: {...admin}
        },
        {
            path: '/user/add',
            component: () => import("@/views/User/UserAdd.vue"),
            meta: {...admin}
        },
        {
            path: '/user/batch',
            component: () => import("@/views/User/UserBatch.vue"),
            meta: {...admin}
        },
        {
            path: '/semester/manager',
            component: () => import("@/views/Semester/SemesterManager.vue"),
            meta: {...user}
        },
        {
            path: '/template/manager',
            component: () => import("@/views/Room/RoomManager.vue"),
            meta: {...user}
        },
        {
            path: '/template/batch',
            component: () => import("@/views/Room/TemplateUpload.vue"),
            meta: {...admin}
        },
        {
            path: '/schedule/manager',
            component: () => import("@/views/Schedule/ScheduleManager.vue"),
            meta: {...admin}
        },
        {
            path: '/checkin/list',
            component: () => import("@/views/CheckIn/CheckInList.vue"),
            meta: {...user}
        },
        {
            path: '/checkin/manager',
            component: () => import("@/views/CheckIn/CheckInManager.vue"),
            meta: {...admin}
        },
        {
            path: '/cloud/manager',
            component: () => import("@/views/Driver/DriverManager.vue"),
            meta: {...user}
        },
        {
            path: '/security/history',
            component: () => import("@/views/Security/SecurityHistory.vue"),
            meta: {...admin}
        },
        {
            path: '/analyzer/view',
            component: () => import("@/views/Analyzer/DataView.vue"),
            meta: {...admin}
        },
        {
            path: '/analyzer/transfer',
            component: () => import("@/views/Analyzer/ZipTransfer.vue"),
            meta: {...user}
        },
        {
            path: '/:pathMatch(.*)',
            component: () => import("@/views/NotFound.vue"),
            meta: {...user}
        }
    ]
})

router.beforeEach((to, from) => {
    if (to.path !== '/' && to.meta.auth && !localStorage.refresh_token) {
        return "/"
    }
    if (to.meta.is_admin === 'true' && localStorage.is_admin !== 'true') {
        return from.path;
    }
})
export default router
