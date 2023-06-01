import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import("@/Home.vue")
        },
        {
            path: '/user/detail',
            component: () => import("@/views/User/MyDetail.vue")
        },
        {
            path: '/user/manager',
            component: () => import("@/views/User/UserManager.vue")
        },
        {
            path: '/user/add',
            component: () => import("@/views/User/UserAdd.vue")
        },
        {
            path: '/user/batch',
            component: () => import("@/views/User/UserBatch.vue")
        },

        {
            path: '/equipment/my',
            component: () => import("@/views/Equipment/MyEquipment.vue")
        },
        {
            path: '/equipment/apply',
            component: () => import("@/views/Equipment/EquipmentApply.vue")
        },
        {
            path: '/equipment/audit',
            component: () => import("@/views/Equipment/EquipmentAudit.vue")
        },
        {
            path: '/equipment/manager',
            component: () => import("@/views/Equipment/EquipmentManager.vue")
        },
        {
            path: '/equipment/add',
            component: () => import("@/views/Equipment/EquipmentAdd.vue")
        },
        {
            path: '/equipment/batch',
            component: () => import("@/views/Equipment/EquipmentBatch.vue")
        },
        {
            path: '/equipment/history',
            component: () => import("@/views/Equipment/EquipmentRentHistory.vue")
        },
        {
            path: '/checkin/list',
            component: () => import("@/views/CheckIn/CheckInList.vue")
        },
        {
            path: '/checkin/manager',
            component: () => import("@/views/CheckIn/CheckInManager.vue")
        },
        {
            path: '/activity/add',
            component: () => import("@/views/Activity/ActivityAdd.vue")
        },
        {
            path: '/activity/list',
            component: () => import("@/views/Activity/ActivityList.vue")
        },
        {
            path: '/activity/manager',
            component: () => import("@/views/Activity/ActivityManager.vue")
        },
        {
            path: '/activity/enrollment',
            component: () => import("@/views/Activity/ActivityEnrollmentManager.vue")
        }
    ]
})

export default router
