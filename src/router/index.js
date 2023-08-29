import {createRouter, createWebHashHistory} from 'vue-router'

const admin = {
    auth: true,
    is_admin: '1',
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
            path: '/equipment/my',
            component: () => import("@/views/Equipment/MyEquipment.vue"),
            meta: {...user}
        },
        {
            path: '/equipment/apply',
            component: () => import("@/views/Equipment/EquipmentApply.vue"),
            meta: {...user}
        },
        {
            path: '/equipment/audit',
            component: () => import("@/views/Equipment/EquipmentAudit.vue"),
            meta: {...admin}
        },
        {
            path: '/equipment/manager',
            component: () => import("@/views/Equipment/EquipmentManager.vue"),
            meta: {...admin}
        },
        {
            path: '/equipment/add',
            component: () => import("@/views/Equipment/EquipmentAdd.vue"),
            meta: {...admin}
        },
        {
            path: '/equipment/batch',
            component: () => import("@/views/Equipment/EquipmentBatch.vue"),
            meta: {...admin}
        },
        {
            path: '/equipment/history',
            component: () => import("@/views/Equipment/EquipmentRentHistory.vue"),
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
            path: '/activity/add',
            component: () => import("@/views/Activity/ActivityAdd.vue"),
            meta: {...admin}
        },
        {
            path: '/activity/list',
            component: () => import("@/views/Activity/ActivityList.vue"),
            meta: {...user}
        },
        {
            path: '/activity/manager',
            component: () => import("@/views/Activity/ActivityManager.vue"),
            meta: {...admin}
        },
        {
            path: '/activity/enrollment',
            component: () => import("@/views/Activity/ActivityEnrollmentManager.vue"),
            meta: {...admin}
        },
        {
            path: '/security/history',
            component: () => import("@/views/Security/SecurityHistory.vue"),
            meta: {...admin}
        },
        {
            path: '/:pathMatch(.*)',
            component: () => import("@/views/NotFound.vue"),
            meta: {...user}
        }
    ]
})

router.beforeEach((to, from) => {
    if (to.path !== '/' && to.meta.auth && !localStorage.token) {
        return "/"
    }
    if (to.meta.is_admin === '1' && localStorage.is_admin !== '1') {
        return from.path;
    }
})
export default router
